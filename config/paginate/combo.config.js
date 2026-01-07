export const comboPaginateConfig = {
  sortableColumns: ["name", "total_price", "created_at"],
  searchableColumns: ["name", "description"],
  filterableColumns: {
    is_active: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 10,
  maxLimit: 50,
};
