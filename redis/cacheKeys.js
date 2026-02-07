import crypto from "crypto";

// Cache key prefixes for each service
export const CACHE_PREFIX = {
  MOVIES: "cache:movies",
  SHOW_TIMES: "cache:show_times",
  COMBOS: "cache:combos",
  MENU_ITEMS: "cache:menu_items",
  EVENTS: "cache:events",
  DISCOUNTS: "cache:discounts",
  MOVIE_TYPES: "cache:movie_types",
  TICKET_PRICES: "cache:ticket_prices",
};

// TTL in seconds
export const TTL = {
  HOT: 60,       // 1 min - show_times, ticket_prices
  WARM: 300,     // 5 min - movies, combos, events, discounts, menu_items
  COLD: 900,     // 15 min - master data (movie_types)
};

/**
 * Build cache key from prefix and query object
 * Normalizes query by sorting keys to ensure same query = same hash
 * 
 * Example:
 *   buildCacheKey("cache:movies", { page: 1, search: "a" })
 *   => "cache:movies:p:a1b2c3d4e5f6"
 */
export const buildCacheKey = (prefix, query) => {
  // Sort keys recursively to ensure consistent hash
  const sortObject = (obj) => {
    if (obj === null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(sortObject);
    return Object.keys(obj)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortObject(obj[key]);
        return acc;
      }, {});
  };

  const sorted = sortObject(query);
  const str = JSON.stringify(sorted);
  const hash = crypto.createHash("md5").update(str).digest("hex").slice(0, 12);
  return `${prefix}:p:${hash}`;
};
