export const moviePaginateConfig = {
  sortableColumns: [
    "title",
    "release_date",
    "created_at",
    "rating",
    "duration",
  ],
  searchableColumns: ["title", "description", "director"],
  filterableColumns: {
    title: true,
    director: true,
    rating: true,
    release_date: true,
    duration: true,
    movie_type_id: true,
    is_active: true,
  },
  defaultSortBy: [["release_date", "DESC"]],
  defaultLimit: 10,
  maxLimit: 50,
};
