export const userPaginateConfig = {
  sortableColumns: ["name", "created_at"],
  searchableColumns: ["name", "email", "phone"],
  filterableColumns: {
    role: true,
    is_active: true,
    is_online: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 10,
  maxLimit: 100,
};
