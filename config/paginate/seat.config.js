export const seatPagiantionConfig = {
  sortableColumns: ["seat_number"],
  searchableColumns: ["seat_number"],
  filterableColumns: {
    room_id: true,
    type: true,
    is_active: true,
  },
  defaultSortBy: [["seat_number", "ASC"]],
  defaultLimit: 10,
  maxLimit: 50,
};
