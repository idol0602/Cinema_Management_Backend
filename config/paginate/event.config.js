export const eventPaginateConfig = {
  sortableColumns: ["name", "start_date", "end_date", "created_at"],
  searchableColumns: ["name", "description"],
  filterableColumns: {
    name: true,
    start_date: true,
    end_date: true,
    is_active: true,
  },
  defaultSortBy: [["start_date", "DESC"]],
  defaultLimit: 10,
  maxLimit: 50,
};
