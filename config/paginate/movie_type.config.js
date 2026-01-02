export const movieTypePaginateConfig = {
  sortableColumns: ["type", "created_at"],
  searchableColumns: ["type"],
  filterableColumns: {
    type: true,
  },
  defaultSortBy: [["type", "ASC"]],
  defaultLimit: 20,
  maxLimit: 100,
};
