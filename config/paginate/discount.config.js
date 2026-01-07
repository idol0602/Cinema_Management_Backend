export const discountPaginateConfig = {
  sortableColumns: [
    "name",
    "discount_percent",
    "valid_from",
    "valid_to",
    "created_at",
  ],
  searchableColumns: ["name", "description"],
  filterableColumns: {
    event_id: true,
    is_active: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 10,
  maxLimit: 50,
};
