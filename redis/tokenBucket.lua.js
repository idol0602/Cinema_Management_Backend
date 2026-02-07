export const tokenBucketScript = `
-- KEYS[1]: redis key
-- ARGV[1]: capacity
-- ARGV[2]: refill_rate (tokens per second)
-- ARGV[3]: now (timestamp seconds)

local bucket = redis.call("HMGET", KEYS[1], "tokens", "last_refill")

local tokens = tonumber(bucket[1])
local last_refill = tonumber(bucket[2])

if tokens == nil then
  tokens = tonumber(ARGV[1])
  last_refill = tonumber(ARGV[3])
end

local delta = tonumber(ARGV[3]) - last_refill
if delta > 0 then
  local refill = delta * tonumber(ARGV[2])
  tokens = math.min(tonumber(ARGV[1]), tokens + refill)
  last_refill = tonumber(ARGV[3])
end

if tokens < 1 then
  redis.call("HMSET", KEYS[1],
    "tokens", tokens,
    "last_refill", last_refill
  )
  redis.call("EXPIRE", KEYS[1], math.ceil(tonumber(ARGV[1]) / tonumber(ARGV[2])))
  return {0, tokens}
end

tokens = tokens - 1

redis.call("HMSET", KEYS[1],
  "tokens", tokens,
  "last_refill", last_refill
)

redis.call("EXPIRE", KEYS[1], math.ceil(tonumber(ARGV[1]) / tonumber(ARGV[2])))

return {1, tokens}
`;
