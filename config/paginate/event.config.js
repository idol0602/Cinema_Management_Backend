export const eventPaginateConfig = {
  sortableColumns: ["name", "start_date", "end_date", "created_at"],
  searchableColumns: ["name", "description"],
  filterableColumns: {
    is_active: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 10,
  maxLimit: 50,
};
