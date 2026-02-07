import "dotenv/config";
import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL_BUSINESS,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});

redis.on("ready", () => console.log("✅ Redis Business ready"));
redis.on("error", (err) => console.error("Redis Business Client Error", err));

export const redisCache = createClient({
  url: process.env.REDIS_URL_CACHE,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});

redisCache.on("ready", () => console.log("✅ Redis Cache ready"));
redisCache.on("error", (err) => console.error("Redis Cache Client Error", err));

await redis.connect();
await redisCache.connect();
