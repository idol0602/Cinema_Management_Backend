export const eventPaginateConfig = {
  sortableColumns: ["name", "start_date", "end_date", "created_at"],
  searchableColumns: ["name", "description"],
  filterableColumns: {
    event_type_id: true,
    only_at_counter: true,
    is_active: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 10,
  maxLimit: 50,
};
