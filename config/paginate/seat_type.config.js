export const seatTypePaginateConfig = {
  sortableColumns: ["name", "created_at"],
  searchableColumns: ["name"],
  filterableColumns: {
    is_active: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 10,
  maxLimit: 100,
};
