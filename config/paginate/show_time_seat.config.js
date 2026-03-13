export const showTimeSeatPaginateConfig = {
  sortableColumns: [],
  searchableColumns: [],
  filterableColumns: {
    show_time_id: true,
    seat_id: true,
    status_seat: true,
  },
  defaultSortBy: [["show_time_id", "ASC"]],
  defaultLimit: 10,
  maxLimit: 100,
  joinTableFields: {
    seats: ["id", "seat_number", "type", "room_id", "seat_types(id, name)"],
  },
};
