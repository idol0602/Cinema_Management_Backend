export const showTimePaginateConfig = {
  sortableColumns: ["start_time", "end_time", "created_at"],
  searchableColumns: [""],
  filterableColumns: {
    movie_id: true,
    room_id: true,
    day_type: true,
    is_active: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 10,
  maxLimit: 100,
};
