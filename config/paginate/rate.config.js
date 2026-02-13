export const ratePaginateConfig = {
  sortableColumns: ["stars", "created_at"],
  searchableColumns: [],
  filterableColumns: {
    movie_id: true,
    stars: true,
    user_id: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 10,
  maxLimit: 100,
};
