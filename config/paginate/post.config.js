export const postPaginateConfig = {
  sortableColumns: ["title", "created_at", "user_id"],
  searchableColumns: ["title", "content"],
  filterableColumns: {
    title: true,
    user_id: true,
    is_active: true,
    created_at: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 15,
  maxLimit: 50,
};
