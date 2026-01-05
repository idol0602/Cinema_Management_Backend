export const moviePaginateConfig = {
  // dùng combobox chọn tiêu chí sort
  sortableColumns: ["title", "release_date", "rating", "duration"],
  // dùng ô search tìm kiếm
  searchableColumns: ["title", "description", "director"],
  // dùng combobox chọn tiêu chí lọc
  filterableColumns: {
    movie_type_id: true,
    is_active: true,
  },
  defaultSortBy: [["release_date", "DESC"]],
  defaultLimit: 10,
  maxLimit: 50,
};
