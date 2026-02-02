export const comboPaginateConfig = {
  sortableColumns: ["name", "total_price", "created_at"],
  searchableColumns: ["name", "description"],
  filterableColumns: {
    is_active: true,
    is_event_combo: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 10,
  maxLimit: 50,

  joinTableFields: {
    combo_movies: ["id", "movie_id"],
    combo_events: ["id", "event_id"],
    combo_items: ["id", "menu_item_id", "quantity", "unit_price", "is_active"],
  },
};
