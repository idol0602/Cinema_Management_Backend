export const orderPaginateConfig = {
  sortableColumns: ["created_at", "total_price"],
  searchableColumns: [],
  filterableColumns: {
    user_id: true,
    discount_id: true,
    payment_status: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 10,
  maxLimit: 100,
};
