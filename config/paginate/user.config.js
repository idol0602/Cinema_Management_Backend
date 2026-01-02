export const userPaginateConfig = {
  sortableColumns: ["name", "email", "created_at", "role", "points"],
  searchableColumns: ["name", "email", "phone"],
  filterableColumns: {
    name: true,
    email: true,
    phone: true,
    role: true,
    points: true,
    is_active: true,
    created_at: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 20,
  maxLimit: 100,
};
