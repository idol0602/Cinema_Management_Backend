export const postPaginateConfig = {
  sortableColumns: ["title", "created_at"],
  searchableColumns: ["title", "content"],
  filterableColumns: {
    is_active: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 10,
  maxLimit: 50,
  joinTableFields: {
    users: ["name","email"],
  },
};
