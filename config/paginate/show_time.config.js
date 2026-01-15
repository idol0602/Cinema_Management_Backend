export const showTimePaginateConfig = {
  sortableColumns: ["start_time", "end_time", "created_at"],
  searchableColumns: ["movies.title"],
  filterableColumns: {
    movie_id: true, // Allow filtering by movie_id (from joined table search)
    room_id: true,
    day_type: true,
    is_active: true,
    start_time: true,
    end_time: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 10,
  maxLimit: 100,
  joinTableFields: {
    movies: [
      "id",
      "title",
      "thumbnail",
      "description",
      "release_date",
      "duration",
    ],
    rooms: ["id", "name"],
  },
};
