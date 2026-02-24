export const conversationPaginateConfig = {
  sortableColumns: ["created_at", "updated_at"],
  searchableColumns: [],
  filterableColumns: {
    customer_id: true,
    staff_id: true,
    status: true,
  },
  defaultSortBy: [["updated_at", "DESC"]],
  defaultLimit: 20,
  maxLimit: 50,
  joinTableFields: {
    "users!conversations_customer_id_fkey": ["id", "name", "email"],
    "users!conversations_staff_id_fkey": ["id", "name", "email"],
  },
};
