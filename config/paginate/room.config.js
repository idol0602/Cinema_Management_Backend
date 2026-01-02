export const roomPaginateConfig = {
  sortableColumns: ["name", "format", "created_at"],
  searchableColumns: ["name", "location"],
  filterableColumns: {
    format: true,
    location: true,
    is_active: true,
  },
  defaultSortBy: [["name", "ASC"]],
  defaultLimit: 15,
  maxLimit: 100,
};
