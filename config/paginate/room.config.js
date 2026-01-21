export const roomPaginateConfig = {
  sortableColumns: ["name", "created_at"],
  searchableColumns: ["name", "location"],
  filterableColumns: {
    format_id: true,
    is_active: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 10,
  maxLimit: 100,
};
