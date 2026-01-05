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
   * 3. INIT QUERY
   * ========================= */
  let q = supabase.from(table).select("*", { count: "exact" });

  /* =========================
   * 4. BASE FILTERS (SYSTEM)
   * ========================= */
  Object.entries(baseFilters).forEach(([key, value]) => {
    q = q.eq(key, value);
  });

  /* =========================
   * 5. USER FILTERS
   * ========================= */
  if (query.filter) {
    Object.entries(query.filter).forEach(([column, condition]) => {
      if (!config.filterableColumns[column]) return;

      // operator-based filter
      if (typeof condition === "object" && !Array.isArray(condition)) {
        Object.entries(condition).forEach(([operator, value]) => {
          q = applyFilterOperator(q, column, operator, value);
        });
      } else {
        // simple equality
        q = q.eq(column, convertValue(condition));
      }
    });
  }

  /* =========================
   * 6. SEARCH
   * ========================= */
  if (query.search && config.searchableColumns.length > 0) {
    const searchColumns = query.searchBy
      ? (Array.isArray(query.searchBy)
          ? query.searchBy
          : [query.searchBy]
        ).filter((c) => config.searchableColumns.includes(c))
      : config.searchableColumns;

    if (searchColumns.length > 0) {
      const orCondition = searchColumns
        .map((c) => `${c}.ilike.%${query.search}%`)
        .join(",");

      q = q.or(orCondition);
    }
  }

  /* =========================
   * 7. APPLY SORT
   * ========================= */
  sortBy.forEach(([column, order]) => {
    q = q.order(column, {
      ascending: order?.toUpperCase() === "ASC",
    });
  });

  /* =========================
   * 8. EXECUTE QUERY
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
    case "$in":
      return query.in(column, Array.isArray(v) ? v : [v]);
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
