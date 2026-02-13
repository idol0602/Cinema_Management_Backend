export const commentPaginateConfig = {
  sortableColumns: ["created_at"],
  searchableColumns: ["content"],
  filterableColumns: {
    movie_id: true,
    is_active: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 10,
  maxLimit: 100,
  joinTableFields: {
    users: ["id", "name"],
  },
};
