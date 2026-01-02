export const showTimePaginateConfig = {
  sortableColumns: ["start_time", "end_time", "day_type", "created_at"],
  searchableColumns: [],
  filterableColumns: {
    movie_id: true,
    room_id: true,
    day_type: true,
    start_time: true,
    is_active: true,
  },
  defaultSortBy: [["start_time", "ASC"]],
  defaultLimit: 20,
  maxLimit: 100,
};
