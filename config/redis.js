import "dotenv/config";
import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});

redis.on("ready", () => console.log("✅ Redis ready"));
redis.on("error", (err) => console.error("Redis Client Error", err));

await redis.connect();
