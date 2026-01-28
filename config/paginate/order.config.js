export const orderPaginateConfig = {
  sortableColumns: ["created_at", "total_price"],
  searchableColumns: ["id", "movies.title", "users.name", "users.email"],
  filterableColumns: {
    user_id: true,
    movie_id: true,
    discount_id: true,
    payment_status: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 10,
  maxLimit: 100,
  joinTableFields: {
    movies: ["id", "title", "thumbnail", "duration"],
    users: ["id", "name", "email", "phone"],
  },
};
