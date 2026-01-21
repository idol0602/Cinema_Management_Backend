export const actionPaginateConfig = {
  sortableColumns: ["name", "path", "method", "created_at"],
  searchableColumns: ["name", "path"],
  filterableColumns: {
    method: true,
    is_active: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 10,
  maxLimit: 100,
};
