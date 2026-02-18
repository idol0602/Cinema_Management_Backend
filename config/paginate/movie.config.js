export const moviePaginateConfig = {
  // dùng combobox chọn tiêu chí sort
  sortableColumns: [
    "title",
    "release_date",
    "rating",
    "duration",
    "created_at",
  ],
  // dùng ô search tìm kiếm
  searchableColumns: ["title", "description", "director"],
  // dùng combobox chọn tiêu chí lọc
  filterableColumns: {
    is_active: true,
    "movie_movie_types.movie_type_id": true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 10,
  maxLimit: 50,
  joinTableFields: {
    movie_movie_types: ["id", "movie_type_id"],
  },
};

export const moviePaginateConfigWithStatus = {
  // SORT
  sortableColumns: [
    "title",
    "release_date",
    "rating",
    "duration",
    "created_at",
  ],

  // SEARCH
  searchableColumns: ["title", "description", "director"],

  // FILTER (CHỈ column thuộc movies)
  filterableColumns: {
    is_active: true,
  },

  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 10,
  maxLimit: 50,

  // ⭐ JOIN TABLE CONFIG
  // View đã có sẵn first_show_time, last_show_time → không cần join show_times
  joinTableFields: {
    movie_movie_types: ["id", "movie_type_id"],
  },
};
