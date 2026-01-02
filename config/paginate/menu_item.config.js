export const menuItemPaginateConfig = {
  sortableColumns: ["name", "price", "item_type", "num_instock", "created_at"],
  searchableColumns: ["name", "description"],
  filterableColumns: {
    name: true,
    item_type: true,
    price: true,
    num_instock: true,
    is_active: true,
  },
  defaultSortBy: [["name", "ASC"]],
  defaultLimit: 15,
  maxLimit: 50,
};
