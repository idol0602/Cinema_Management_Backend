import { supabase } from "../config/supabase.js";
import { showTimeSeatPaginateConfig } from "../config/paginate/show_time_seat.config.js";
import { paginate } from "../utils/paginate.js";
import { redis } from "../config/redis.js";
import { publishSeatExpirationDLX } from "../config/rabbitmq.js";
import { SEAT_STATUS } from "../utils/seatStatus.js";

export const create = async (payload) => {
  return await supabase.from("show_time_seats").insert(payload).single();
};

export const findAll = async () => {
  return await supabase.from("show_time_seats").select("*");
};

export const findById = async (id) => {
  return await supabase
    .from("show_time_seats")
    .select("*")
    .eq("id", id)
    .single();
};

export const update = async (id, data) => {
  return await supabase.from("show_time_seats").update(data).eq("id", id);
};

export const remove = async (id) => {
  return await supabase.from("show_time_seats").delete().eq("id", id);
};

export const getStatus = async (id) => {
  return supabase.from("show_time_seats").select("status_seat").eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "show_time_seats",
    query: query,
    config: showTimeSeatPaginateConfig,
    baseFilters: {},
  });
};

export const bulkCreate = async (payload) => {
  return await supabase.from("show_time_seats").insert(payload);
};

export const findByShowTimeId = async (showTimeId) => {
  return await supabase
    .from("show_time_seats")
    .select("*")
    .eq("show_time_id", showTimeId);
};

export const holdSeat = async (showTimeSeatId, userId, ttlSeconds = 600) => {
  // Check if seat exists and get current status
  const { data: seat, error: seatError } = await supabase
    .from("show_time_seats")
    .select("*")
    .eq("id", showTimeSeatId)
    .maybeSingle();

  if (seatError) {
    return { data: null, error: seatError };
  }

  if (!seat) {
    return { data: null, error: { message: "Seat not found" } };
  }

  // Check if seat is already held by someone else
  const redisKey = `seat:hold:${showTimeSeatId}:${userId}`;
  const existingHold = await redis.get(redisKey);

  if (existingHold) {
    const holdData = JSON.parse(existingHold);
    if (holdData.userId !== userId) {
      return {
        data: null,
        error: { message: "Seat is already held by another user" },
      };
    }
    // If same user, extend the hold
  }

  // Only allow holding if seat is AVAILABLE or HOLDING
  if (
    seat.status_seat !== SEAT_STATUS.AVAILABLE &&
    seat.status_seat !== SEAT_STATUS.HOLDING
  ) {
    return {
      data: null,
      error: { message: `Cannot hold seat with status: ${seat.status_seat}` },
    };
  }

  // Set hold in Redis with TTL
  const holdData = {
    userId,
    heldAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
  };

  await redis.set(redisKey, JSON.stringify(holdData), {
    EX: ttlSeconds,
    NX: true,
  });

  // Publish delayed message to RabbitMQ for expiration check
  await publishSeatExpirationDLX(
    { showTimeSeatId, userId, heldAt: holdData.heldAt },
    ttlSeconds * 1000, // Convert to milliseconds
  ); // Update database status to HOLDING
  const { data: updatedSeat, error: updateError } = await supabase
    .from("show_time_seats")
    .update({ status_seat: SEAT_STATUS.HOLDING })
    .eq("id", showTimeSeatId)
    .select()
    .maybeSingle();

  if (updateError || !updatedSeat) {
    // Rollback Redis if database update fails
    await redis.del(redisKey);
    return {
      data: null,
      error: updateError || { message: "Failed to update seat status" },
    };
  }

  return { data: { ...updatedSeat, holdInfo: holdData }, error: null };
};

export const cancelHoldSeat = async (showTimeSeatId, userId) => {
  const redisKey = `seat:hold:${showTimeSeatId}:${userId}`;
  const existingHold = await redis.get(redisKey);

  if (!existingHold) {
    return {
      data: null,
      error: { message: "Seat is not currently held" },
    };
  }

  const holdData = JSON.parse(existingHold);

  // Verify the user is the one who held the seat
  if (holdData.userId !== userId) {
    return {
      data: null,
      error: { message: "You can only cancel your own holds" },
    };
  }

  // Delete hold from Redis
  await redis.del(redisKey);

  // Update database status back to AVAILABLE
  const { data: updatedSeat, error: updateError } = await supabase
    .from("show_time_seats")
    .update({ status_seat: SEAT_STATUS.AVAILABLE })
    .eq("id", showTimeSeatId)
    .select()
    .maybeSingle(); // Changed .single() to .maybeSingle() for consistency and robustness

  if (updateError || !updatedSeat) {
    return {
      data: null,
      error: updateError || { message: "Failed to update seat status" },
    };
  }

  return { data: updatedSeat, error: null };
};

export const getHoldInfo = async (showTimeSeatId, userId) => {
  const redisKey = `seat:hold:${showTimeSeatId}:${userId}`;
  const holdData = await redis.get(redisKey);

  if (!holdData) {
    return { data: null, error: null };
  }

  return { data: JSON.parse(holdData), error: null };
};

export const getAllHeldSeatsByUserId = async (userId) => {
  try {
    // Get all keys matching pattern seat:hold:*:userId
    const pattern = `seat:hold:*:${userId}`;
    const keys = await redis.keys(pattern);

    if (!keys || keys.length === 0) {
      return { data: [], error: null };
    }

    // Get all hold data for these keys
    const holdDataList = [];
    for (const key of keys) {
      const holdData = await redis.get(key);
      if (holdData) {
        // Extract showTimeSeatId from key (format: seat:hold:{showTimeSeatId}:{userId})
        const showTimeSeatId = key.split(":")[2];
        holdDataList.push({
          showTimeSeatId,
          ...JSON.parse(holdData),
        });
      }
    }

    return { data: holdDataList, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const bulkHoldSeats = async (
  showTimeSeatIds,
  userId,
  ttlSeconds = 600,
) => {
  const results = [];
  const successfulHolds = [];
  for (const seatId of showTimeSeatIds) {
    const result = await holdSeat(seatId, userId, ttlSeconds);
    results.push({ seatId, ...result });

    if (result.error) {
      // Rollback all successful holds
      for (const successSeatId of successfulHolds) {
        await cancelHoldSeat(successSeatId, userId);
      }
      return {
        data: null,
        error: {
          message: "Failed to hold all seats",
          details: results,
        },
      };
    }

    successfulHolds.push(seatId);
  }

  return { data: results, error: null };
};

export const bulkCancelHoldSeats = async (showTimeSeatIds, userId) => {
  const results = [];

  for (const seatId of showTimeSeatIds) {
    const result = await cancelHoldSeat(seatId, userId);
    results.push({ seatId, ...result });
  }

  return { data: results, error: null };
};
