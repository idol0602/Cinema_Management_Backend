import { redis } from "../config/redis.js";
import { tokenBucketScript } from "../redis/tokenBucket.lua.js";

export const rateLimitByUser = ({
    action,
    capacity,
    refillRate,
}) => {
    return async (req, res, next) => {
        if(!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const key = `rate:user:${req.user.id}:${action}`;
        const now = Math.floor(Date.now() / 1000);
        
        try {
            const [allowed, tokensLeft] = await redis.eval(
                tokenBucketScript,
                {
                    keys: [key],
                    arguments: [String(capacity), String(refillRate), String(now)],
                }
            );
           res.setHeader(
                "X-RateLimit-Remaining",
                Math.floor(tokensLeft)
            );

            if (allowed === 0) {
                return res.status(429).json({
                    message: "Too many requests",
                });
            }
            next();
        } catch (error) {
            console.error("Rate limit error:", error);
            next();
        }
    }
}