export const ticketPricePaginateConfig = {
  sortableColumns: ["price", "created_at"],
  searchableColumns: [],
  filterableColumns: {
    format_id: true,
    seat_type_id: true,
    day_type: true,
    is_active: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 10,
  maxLimit: 100,
};