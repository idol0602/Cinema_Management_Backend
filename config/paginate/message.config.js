export const messagePaginateConfig = {
  sortableColumns: ["created_at"],
  searchableColumns: ["content"],
  filterableColumns: {
    conversation_id: true,
    sender_id: true,
    type: true,
    is_seen: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 50,
  maxLimit: 100,
  joinTableFields: {
    "users!messages_sender_id_fkey": ["id", "name", "email"],
  },
};
