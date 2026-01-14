/**
 * Universal pagination utility for Supabase
 * Config-driven – reusable for all tables
 *
 * Supported:
 * - pagination
 * - multi sort
 * - search (multi columns)
 * - filter with operators
 * - base filters (system-level)
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
  /* =========================
   * 1. PAGINATION
   * ========================= */
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(
    Math.max(1, Number(query.limit) || config.defaultLimit),
    config.maxLimit
  );
  const offset = (page - 1) * limit;

  /* =========================
   * 2. SORT
   * ========================= */
  let sortBy = config.defaultSortBy;

  if (query.sortBy) {
    sortBy = (Array.isArray(query.sortBy) ? query.sortBy : [query.sortBy])
      .map((s) => s.split(":"))
      .filter(([column]) => config.sortableColumns.includes(column));
  }

  /* =========================
   * 3. HANDLE JOINED TABLE SEARCH
   * ========================= */
  let modifiedQuery = { ...query };

  if (query.search && query.searchBy && query.searchBy.includes(".")) {
    const [searchTable, searchColumn] = query.searchBy.split(".");
    // Query the joined table to get IDs
    const { data: results, error: searchError } = await supabase
      .from(searchTable)
      .select("id")
      .ilike(searchColumn, `%${query.search}%`);

    if (searchError) {
      return {
        data: [],
        error: searchError.message,
        meta: {
          totalItems: 0,
          itemCount: 0,
          itemsPerPage: limit,
          totalPages: 0,
          currentPage: page,
        },
      };
    }

    const joinedIds = results?.map((r) => r.id) || [];

    if (joinedIds.length === 0) {
      // No results found
      return {
        data: [],
        error: null,
        meta: {
          totalItems: 0,
          itemCount: 0,
          itemsPerPage: limit,
          totalPages: 0,
          currentPage: page,
        },
        links: {
          first: undefined,
          previous: undefined,
          current: `?page=${page}&limit=${limit}`,
          next: undefined,
          last: undefined,
        },
      };
    }

    // Get the foreign key for this table
    const foreignKey = joinTables[searchTable];
    if (!foreignKey) {
      return {
        data: [],
        error: `Foreign key not defined for ${searchTable}`,
        meta: {
          totalItems: 0,
          itemCount: 0,
          itemsPerPage: limit,
          totalPages: 0,
          currentPage: page,
        },
      };
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
   * 4. INIT QUERY - ADVANCED
   * ========================= */
  let selectStr = "*";

  if (Object.keys(joinTables).length > 0) {
    const joinSelects = Object.keys(joinTables).map((joinTable) => {
      let fields = ["id"];

      if (config.joinTableFields?.[joinTable]) {
        fields = config.joinTableFields[joinTable];
      }

      return `${joinTable}(${fields.join(",")})`;
    });
    selectStr = `*, ${joinSelects.join(", ")}`;
  }

  let q = supabase.from(table).select(selectStr, { count: "exact" });

  /* =========================
   * 5. BASE FILTERS (SYSTEM)
   * ========================= */
  Object.entries(baseFilters).forEach(([key, value]) => {
    q = q.eq(key, value);
  });

  /* =========================
   * 6. USER FILTERS (using modifiedQuery)
   * ========================= */
  if (modifiedQuery.filter) {
    Object.entries(modifiedQuery.filter).forEach(([column, condition]) => {
      if (!config.filterableColumns[column]) return;

      // ✅ CASE 1: filter[field]=[A,B,C]  => IN
      if (Array.isArray(condition)) {
        q = applyFilterOperator(q, column, "$in", condition);
        return;
      }

      // ✅ CASE 2: filter[field][$gt]=..., $in, $lte...
      if (typeof condition === "object" && condition !== null) {
        Object.entries(condition).forEach(([operator, value]) => {
          q = applyFilterOperator(q, column, operator, value);
        });
        return;
      }

      // ✅ CASE 3: filter[field]=A
      q = q.eq(column, convertValue(condition));
    });
  }

  /* =========================
   * 7. SEARCH (direct columns only, joined tables already handled)
   * ========================= */
  if (modifiedQuery.search && config.searchableColumns.length > 0) {
    const searchColumns = modifiedQuery.searchBy
      ? (Array.isArray(modifiedQuery.searchBy)
          ? modifiedQuery.searchBy
          : [modifiedQuery.searchBy]
        ).filter((c) => config.searchableColumns.includes(c))
      : config.searchableColumns;

    // Only handle direct column searches (no dots)
    const directSearches = searchColumns.filter((c) => !c.includes("."));

    if (directSearches.length > 0) {
      const orCondition = directSearches
        .map((c) => `${c}.ilike.%${modifiedQuery.search}%`)
        .join(",");

      q = q.or(orCondition);
    }
  }

  /* =========================
   * 8. APPLY SORT
   * ========================= */
  sortBy.forEach(([column, order]) => {
    q = q.order(column, {
      ascending: order?.toUpperCase() === "ASC",
    });
  });

  /* =========================
   * 9. EXECUTE QUERY
   * ========================= */
  const { data, error, count } = await q.range(offset, offset + limit - 1);

  if (error) {
    return { data: null, error };
  }

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
    links: {
      first: page > 1 ? `?page=1&limit=${limit}` : undefined,
      previous: page > 1 ? `?page=${page - 1}&limit=${limit}` : undefined,
      current: `?page=${page}&limit=${limit}`,
      next: page < totalPages ? `?page=${page + 1}&limit=${limit}` : undefined,
      last:
        page < totalPages ? `?page=${totalPages}&limit=${limit}` : undefined,
    },
  };
}

/* ======================================================
 * FILTER OPERATOR HANDLER
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
      if (!Array.isArray(values)) {
        values = [values];
      }
      return query.in(column, values);
    }
    case "$contains":
    case "$ilike":
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
 * CONFIG FACTORY (OPTIONAL)
 * ====================================================== */
export function createPaginateConfig({
  sortableColumns = ["created_at"],
  searchableColumns = [],
  filterableColumns = {},
  defaultSortBy = [["created_at", "DESC"]],
  defaultLimit = 10,
  maxLimit = 50,
}) {
  return {
    sortableColumns,
    searchableColumns,
    filterableColumns,
    defaultSortBy,
    defaultLimit,
    maxLimit,
  };
}
