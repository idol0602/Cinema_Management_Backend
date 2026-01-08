export const movieTypePaginateConfig = {
  sortableColumns: ["type", "created_at"],
  searchableColumns: ["type"],
  filterableColumns: {
    is_active: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 10,
  maxLimit: 100,
};
