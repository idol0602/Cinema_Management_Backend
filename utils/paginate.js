// Backend/utils/paginate.js
import qs from "qs";

export async function paginate(
  supabase,
  table,
  query,
  config,
  baseFilters = {}
) {
  if (!config) {
    throw new Error(`Paginate config is required`);
  }

  const parsed = typeof query === "string" ? qs.parse(query) : query;

  const page = Math.max(1, parseInt(parsed.page) || 1);
  const limit = Math.min(
    parseInt(parsed.limit) || config.defaultLimit,
    config.maxLimit
  );

  // Parse sortBy như nestjs-paginate: ?sortBy=title:ASC
  let sortBy = config.defaultSortBy;
  if (parsed.sortBy) {
    sortBy = Array.isArray(parsed.sortBy)
      ? parsed.sortBy.map((s) => s.split(":"))
      : [parsed.sortBy.split(":")];
  }

  const offset = (page - 1) * limit;

  // Base query
  let q = supabase.from(table).select("*", { count: "exact" });

  // Base filters (như is_active)
  Object.entries(baseFilters).forEach(([k, v]) => (q = q.eq(k, v)));

  // Filters - support nestjs-paginate format
  if (parsed.filter) {
    Object.entries(parsed.filter).forEach(([k, v]) => {
      if (!config.filterableColumns[k]) return;

      if (typeof v === "object" && !Array.isArray(v)) {
        // Operators: $eq, $gt, $gte, $lt, $lte, $in, $btw, etc
        Object.entries(v).forEach(([op, val]) => {
          switch (op) {
            case "$eq":
              q = q.eq(k, val);
              break;
            case "$ne":
            case "$not":
              q = q.neq(k, val);
              break;
            case "$gt":
              q = q.gt(k, val);
              break;
            case "$gte":
              q = q.gte(k, val);
              break;
            case "$lt":
              q = q.lt(k, val);
              break;
            case "$lte":
              q = q.lte(k, val);
              break;
            case "$in":
              q = q.in(k, Array.isArray(val) ? val : [val]);
              break;
            case "$contains":
            case "$ilike":
              q = q.ilike(k, `%${val}%`);
              break;
            case "$starts":
              q = q.ilike(k, `${val}%`);
              break;
            case "$ends":
              q = q.ilike(k, `%${val}`);
              break;
            case "$null":
              q = val ? q.is(k, null) : q.not(k, "is", null);
              break;
            case "$btw":
              if (Array.isArray(val) && val.length === 2) {
                q = q.gte(k, val[0]).lte(k, val[1]);
              }
              break;
            default:
              q = q.eq(k, val);
          }
        });
      } else {
        q = q.eq(k, v);
      }
    });
  }

  // Search - nestjs-paginate style
  if (parsed.search) {
    const searchBy = parsed.searchBy
      ? Array.isArray(parsed.searchBy)
        ? parsed.searchBy
        : [parsed.searchBy]
      : config.searchableColumns;

    const validSearchColumns = searchBy.filter((col) =>
      config.searchableColumns.includes(col)
    );

    if (validSearchColumns.length > 0) {
      q = q.or(
        validSearchColumns.map((c) => `${c}.ilike.%${parsed.search}%`).join(",")
      );
    }
  }

  // Sort - support multiple sort
  sortBy.forEach(([column, order]) => {
    if (config.sortableColumns.includes(column)) {
      q = q.order(column, {
        ascending: order?.toUpperCase() === "ASC" || order === "1",
      });
    }
  });

  // Paginate
  const { data, error, count } = await q.range(offset, offset + limit - 1);

  if (error) {
    return { data: null, error };
  }

  const totalPages = Math.ceil(count / limit);

  // Response format giống nestjs-paginate
  return {
    data,
    error: null,
    meta: {
      itemsPerPage: limit,
      totalItems: count,
      currentPage: page,
      totalPages: totalPages,
      sortBy: sortBy,
      search: parsed.search,
      searchBy: parsed.searchBy,
      filter: parsed.filter,
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
