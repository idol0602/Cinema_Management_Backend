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
    discount_percent: true,
    valid_from: true,
    valid_to: true,
    is_active: true,
  },
  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 15,
  maxLimit: 50,
};
