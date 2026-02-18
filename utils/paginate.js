/**
 * Universal pagination utility for Supabase
 *
 * Supported:
 * - Pagination (page, limit, offset)
 * - Multi-column sort (including join table columns)
 * - Search (multi columns, direct + join)
 * - Filter operators ($eq $ne $gt $gte $lt $lte $in $nin $ilike $contains $starts $ends $null $btw $overlap)
 * - Base filters (eq + operator support)
 * - JOIN select with configurable fields
 * - JOIN search (pre-query or !inner)
 * - JOIN filtering with AND/OR mode
 * - Custom select columns
 * - Configurable primary key
 */

/* ======================================================
 * MAIN PAGINATE FUNCTION
 * ====================================================== */
export async function paginate({
  supabase,
  table,
  query = {},
  config,
  baseFilters = {},
  joinTables = {},
}) {
  if (!supabase) throw new Error("Supabase client is required");
  if (!table) throw new Error("Table name is required");
  if (!config)
    throw new Error(`Paginate config is required for table: ${table}`);

  const primaryKey = config.primaryKey || "id";

  try {
    /* =========================
     * 1. PAGINATION
     * ========================= */
    const page = Math.max(1, Number(query.page) || 1);

    const isNoLimit =
      query.limit === undefined || query.limit === null || query.limit === "";

    const limit = isNoLimit
      ? config.maxLimit * 1000
      : Math.min(
          Math.max(1, Number(query.limit) || config.defaultLimit),
          config.maxLimit,
        );

    const offset = (page - 1) * limit;

    /* =========================
     * 2. SORT
     * ========================= */
    let sortBy = config.defaultSortBy;

    if (query.sortBy) {
      sortBy = (Array.isArray(query.sortBy) ? query.sortBy : [query.sortBy])
        .map((s) => s.split(":"))
        .filter(([column]) => {
          // Allow sorting on join columns: "joinTable.column"
          if (column.includes(".")) {
            const [joinTable] = column.split(".");
            return !!joinTables[joinTable];
          }
          return config.sortableColumns.includes(column);
        });
    }

    /* =========================
     * 3. HANDLE JOIN SEARCH
     * ========================= */
    let modifiedQuery = { ...query };

    if (query.search && query.searchBy && query.searchBy.includes(".")) {
      const [searchTable, searchColumn] = query.searchBy.split(".");

      const { data: results, error } = await supabase
        .from(searchTable)
        .select(primaryKey)
        .ilike(searchColumn, `%${query.search}%`);

      if (error) {
        return emptyResult(page, limit, error.message);
      }

      const joinedIds = results?.map((r) => r[primaryKey]) || [];

      if (!joinedIds.length) {
        return emptyResult(page, limit);
      }

      const foreignKey = joinTables[searchTable];
      if (!foreignKey) {
        return emptyResult(
          page,
          limit,
          `Foreign key not defined for ${searchTable}`,
        );
      }

      modifiedQuery = {
        ...query,
        search: undefined,
        searchBy: undefined,
        filter: {
          ...(query.filter || {}),
          [foreignKey]: joinedIds,
        },
      };
    }

    /* =========================
     * 3.5. FLATTEN NESTED FILTER (allowDots: true support)
     * ========================= */
    // qs.parse with allowDots: true turns "movie_movie_types.movie_type_id"
    // into { movie_movie_types: { movie_type_id: value } }
    // We need to flatten it back to dot notation for join filter logic
    if (modifiedQuery.filter) {
      modifiedQuery.filter = flattenJoinFilters(
        modifiedQuery.filter,
        joinTables,
      );
    }

    /* =========================
     * 3.6. PRE-QUERY JOIN TABLE FOR AND FILTER
     * ========================= */
    // When filtering on a join column with multiple values (array),
    // determine AND vs OR logic from config.joinFilterMode.
    //   - "and" (default): parent must match ALL values
    //   - "or": parent matches ANY value (standard $in)
    const joinAndFilterIds = []; // will hold arrays of matching parent IDs
    if (modifiedQuery.filter) {
      const newFilter = { ...modifiedQuery.filter };

      for (const [column, condition] of Object.entries(modifiedQuery.filter)) {
        if (!column.includes(".")) continue;

        const [joinTable, joinColumn] = column.split(".");
        if (!joinTables[joinTable]) continue;

        // Determine filter mode for this join column
        const filterMode = config.joinFilterMode?.[column] || "and";

        // Normalize values
        let values = condition;
        if (typeof condition === "string" && condition.includes(",")) {
          values = condition.split(",").map((x) => x.trim());
        }

        // Only apply AND pre-query for array values with 2+ items
        if (!Array.isArray(values) || values.length < 2) continue;

        // If mode is "or", leave it for step 6 ($in filter)
        if (filterMode === "or") continue;

        const foreignKey = joinTables[joinTable]; // e.g. "movie_id"

        // Query join table: get all rows matching any of the values
        const { data: joinRows, error: joinError } = await supabase
          .from(joinTable)
          .select(foreignKey + "," + joinColumn)
          .in(joinColumn, values);

        if (joinError || !joinRows) {
          return emptyResult(page, limit, joinError?.message);
        }

        // Group by foreign key, count distinct matched values
        const fkToMatchedValues = {};
        for (const row of joinRows) {
          const fk = row[foreignKey];
          if (!fkToMatchedValues[fk]) fkToMatchedValues[fk] = new Set();
          fkToMatchedValues[fk].add(String(row[joinColumn]));
        }

        // Keep only parent IDs that have ALL required values
        const matchingIds = Object.entries(fkToMatchedValues)
          .filter(([, matched]) => matched.size >= values.length)
          .map(([fk]) => fk);

        if (matchingIds.length === 0) {
          return emptyResult(page, limit);
        }

        joinAndFilterIds.push(matchingIds);

        // Remove this filter from modifiedQuery.filter
        // (it's now handled via ID filtering)
        delete newFilter[column];
      }

      modifiedQuery.filter = newFilter;
    }

    /* =========================
     * 4. BUILD SELECT WITH JOIN
     * ========================= */

    // Detect which join tables have active filters
    // so we can use !inner to filter parent rows (not just nested rows)
    const filteredJoinTables = new Set();
    if (modifiedQuery.filter) {
      Object.keys(modifiedQuery.filter).forEach((column) => {
        if (column.includes(".")) {
          const [joinTable] = column.split(".");
          if (joinTables[joinTable]) {
            filteredJoinTables.add(joinTable);
          }
        }
      });
    }

    // Build select string
    const baseSelect = config.selectColumns
      ? config.selectColumns.join(", ")
      : "*";

    let selectStr = baseSelect;

    if (Object.keys(joinTables).length > 0) {
      const joinSelects = Object.keys(joinTables).map((joinTable) => {
        let fields = [primaryKey];

        if (config.joinTableFields?.[joinTable]) {
          fields = config.joinTableFields[joinTable];
        }

        // Use !inner for join tables that have active filters
        // This ensures parent rows are filtered, not just the nested data
        const innerJoin = filteredJoinTables.has(joinTable) ? "!inner" : "";
        return `${joinTable}${innerJoin}(${fields.join(",")})`;
      });

      selectStr = `${baseSelect}, ${joinSelects.join(", ")}`;
    }

    let q = supabase.from(table).select(selectStr, { count: "exact" });

    /* =========================
     * 5. BASE FILTERS (with operator support)
     * ========================= */
    Object.entries(baseFilters).forEach(([key, value]) => {
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        // Operator-style base filter: { is_active: { $eq: true } }
        Object.entries(value).forEach(([operator, opValue]) => {
          q = applyFilterOperator(q, key, operator, opValue);
        });
      } else if (Array.isArray(value)) {
        q = q.in(key, value);
      } else {
        q = q.eq(key, value);
      }
    });

    /* =========================
     * 5.5. APPLY JOIN AND-FILTER IDs
     * ========================= */
    // Apply pre-queried parent IDs (AND logic for join table filters)
    if (joinAndFilterIds.length > 0) {
      // Intersect all ID arrays to support multiple AND join filters
      let intersectedIds = joinAndFilterIds[0];
      for (let i = 1; i < joinAndFilterIds.length; i++) {
        const idSet = new Set(joinAndFilterIds[i]);
        intersectedIds = intersectedIds.filter((id) => idSet.has(id));
      }

      if (intersectedIds.length === 0) {
        return emptyResult(page, limit);
      }

      q = q.in(primaryKey, intersectedIds);
    }

    /* =========================
     * 6. USER FILTERS (JOIN SUPPORT)
     * ========================= */
    if (modifiedQuery.filter) {
      Object.entries(modifiedQuery.filter).forEach(([column, condition]) => {
        const isJoinColumn = column.includes(".");
        let targetColumn = column;

        // ✅ JOIN FILTER VALIDATION
        if (isJoinColumn) {
          const [joinTable] = column.split(".");

          // join must exist in joinTables config
          if (!joinTables[joinTable]) return;

          // Whitelist: allow if column is in filterableColumns OR filterableJoinColumns
          const isAllowed =
            config.filterableColumns?.[column] ||
            config.filterableJoinColumns?.[column];

          if (!isAllowed) return;
        } else {
          // base table whitelist
          if (!config.filterableColumns?.[column]) return;
        }

        /* ---------- APPLY FILTER ---------- */

        if (Array.isArray(condition)) {
          q = applyFilterOperator(q, targetColumn, "$in", condition);
          return;
        }

        if (typeof condition === "object" && condition !== null) {
          Object.entries(condition).forEach(([operator, value]) => {
            q = applyFilterOperator(q, targetColumn, operator, value);
          });
          return;
        }

        q = q.eq(targetColumn, convertValue(condition));
      });
    }

    /* =========================
     * 7. DIRECT SEARCH
     * ========================= */
    if (modifiedQuery.search && config.searchableColumns.length > 0) {
      const searchColumns = modifiedQuery.searchBy
        ? (Array.isArray(modifiedQuery.searchBy)
            ? modifiedQuery.searchBy
            : [modifiedQuery.searchBy]
          ).filter((c) => config.searchableColumns.includes(c))
        : config.searchableColumns;

      const directSearches = searchColumns.filter((c) => !c.includes("."));

      if (directSearches.length > 0) {
        const orCondition = directSearches
          .map((c) => `${c}.ilike.%${modifiedQuery.search}%`)
          .join(",");

        q = q.or(orCondition);
      }
    }

    /* =========================
     * 8. SORT (with join table support)
     * ========================= */
    sortBy.forEach(([column, order]) => {
      const ascending = order?.toUpperCase() === "ASC";

      if (column.includes(".")) {
        // Sort on foreign table column: "movies.title"
        const [foreignTable, foreignColumn] = column.split(".");
        q = q.order(foreignColumn, {
          ascending,
          referencedTable: foreignTable,
        });
      } else {
        q = q.order(column, { ascending });
      }
    });

    /* =========================
     * 9. EXECUTE
     * ========================= */
    const { data, error, count } = await q.range(offset, offset + limit - 1);

    if (error) return { data: null, error };

    const totalPages = Math.ceil(count / limit);

    return {
      data,
      error: null,
      meta: {
        totalItems: count,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
        sortBy,
        search: query.search,
        searchBy: query.searchBy,
        filter: query.filter,
      },
    };
  } catch (err) {
    return {
      data: null,
      error: err.message || "An unexpected error occurred in paginate",
    };
  }
}

/* ======================================================
 * FLATTEN NESTED JOIN FILTERS
 * ====================================================== */
function flattenJoinFilters(filter, joinTables) {
  const flattened = {};
  Object.entries(filter).forEach(([key, value]) => {
    if (
      !key.includes(".") &&
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      joinTables[key]
    ) {
      // Nested join filter object → flatten to dot notation
      Object.entries(value).forEach(([subKey, subValue]) => {
        flattened[`${key}.${subKey}`] = subValue;
      });
    } else {
      flattened[key] = value;
    }
  });
  return flattened;
}

/* ======================================================
 * FILTER OPERATORS
 * ====================================================== */
function applyFilterOperator(query, column, operator, value) {
  const v = convertValue(value);

  switch (operator) {
    case "$eq":
      return query.eq(column, v);
    case "$ne":
    case "$not":
      return query.neq(column, v);
    case "$gt":
      return query.gt(column, v);
    case "$gte":
      return query.gte(column, v);
    case "$lt":
      return query.lt(column, v);
    case "$lte":
      return query.lte(column, v);
    case "$in": {
      let values = v;
      if (typeof v === "string") {
        values = v.split(",").map((x) => x.trim());
      }
      if (!Array.isArray(values)) values = [values];
      return query.in(column, values);
    }
    case "$nin": {
      // NOT IN — exclude rows matching any of the values
      let values = v;
      if (typeof v === "string") {
        values = v.split(",").map((x) => x.trim());
      }
      if (!Array.isArray(values)) values = [values];
      // Supabase: .not("column", "in", "(val1,val2)")
      return query.not(column, "in", `(${values.join(",")})`);
    }
    case "$ilike":
    case "$contains":
      return query.ilike(column, `%${v}%`);
    case "$starts":
      return query.ilike(column, `${v}%`);
    case "$ends":
      return query.ilike(column, `%${v}`);
    case "$null":
      return v ? query.is(column, null) : query.not(column, "is", null);
    case "$btw":
      if (Array.isArray(v) && v.length === 2) {
        return query.gte(column, v[0]).lte(column, v[1]);
      }
      return query;
    case "$overlap":
      // Array overlap — for Postgres array columns
      if (Array.isArray(v)) {
        return query.overlaps(column, v);
      }
      return query;
    default:
      return query.eq(column, v);
  }
}

/* ======================================================
 * VALUE CONVERTER
 * ====================================================== */
function convertValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;

  if (typeof value === "string" && value.trim() !== "" && !isNaN(value)) {
    return Number(value);
  }

  return value;
}

/* ======================================================
 * EMPTY RESULT HELPER
 * ====================================================== */
function emptyResult(page, limit, error = null) {
  return {
    data: [],
    error,
    meta: {
      totalItems: 0,
      itemCount: 0,
      itemsPerPage: limit,
      totalPages: 0,
      currentPage: page,
    },
  };
}

/* ======================================================
 * CONFIG FACTORY
 * ====================================================== */
export function createPaginateConfig({
  sortableColumns = ["created_at"],
  searchableColumns = [],
  filterableColumns = {},
  filterableJoinColumns = {},
  defaultSortBy = [["created_at", "DESC"]],
  defaultLimit = 10,
  maxLimit = 50,
  joinTableFields = {},
  joinFilterMode = {}, // { "joinTable.column": "and" | "or" } — default "and"
  selectColumns = null, // string[] | null — custom select columns, null = "*"
  primaryKey = "id", // primary key column name
}) {
  return {
    sortableColumns,
    searchableColumns,
    filterableColumns,
    filterableJoinColumns,
    defaultSortBy,
    defaultLimit,
    maxLimit,
    joinTableFields,
    joinFilterMode,
    selectColumns,
    primaryKey,
  };
}
