import { redisCache } from "../config/redis.js";

export const getCache = async (key) => {
    const cached = await redisCache.get(key);
    if (cached) {
        return JSON.parse(cached);
    }
    return null;
};

export const setCache = async (key, value) => {
    await redisCache.set(key, JSON.stringify(value));
};

// Set cache with TTL (time to live) in seconds
export const setCacheWithTTL = async (key, value, ttlSeconds) => {
    await redisCache.setEx(key, ttlSeconds, JSON.stringify(value));
};

export const deleteCache = async (key) => {
    await redisCache.del(key);
};

// Delete all keys matching a pattern (e.g., "cache:movies:*")
export const deleteCacheByPattern = async (pattern) => {
    const keys = await redisCache.keys(pattern);
    if (keys.length > 0) {
        await redisCache.del(keys);
    }
    return keys.length;
};

export const clearCache = async () => {
    await redisCache.flushdb();
};
