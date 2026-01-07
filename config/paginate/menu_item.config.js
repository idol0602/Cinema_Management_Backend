export const menuItemPaginateConfig = {
  sortableColumns: ["name", "price", "created_at", "num_instock"],
  searchableColumns: ["name", "description"],
  filterableColumns: {
    name: true,
    item_type: true,
    is_active: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 10,
  maxLimit: 50,
};
