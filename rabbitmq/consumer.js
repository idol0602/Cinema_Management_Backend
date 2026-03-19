import { EXCHANGE } from "./exchange.js";
import { getChannel } from "../config/rabbitmq.js";
import { handleSendMail } from "../utils/mail.js";
import { handleSeatExpiration } from "../repositories/show_time_seats.repo.js";
import { deleteCacheByPattern } from "../redis/cache.js";

export const Consumer = {
  ready: async () => {
    try {
      console.log("[Consumer] Initializing mail consumer...");
      await Consumer.mail();
      console.log("[Consumer] Mail consumer ready");

      console.log("[Consumer] Initializing seat expiration consumer...");
      await Consumer.seatExpiration();
      console.log("[Consumer] Seat expiration consumer ready");

      console.log("[Consumer] Initializing delete cache consumer...");
      await Consumer.deleteCache();
      console.log("[Consumer] Delete cache consumer ready");
    } catch (error) {
      console.error("[Consumer] Error during consumer setup:", error.message);
      throw error;
    }
  },

  mail: async () => {
    const channel = getChannel();
    if (!channel) {
      throw new Error("[Consumer.mail] Channel is not available");
    }
    await channel.consume(EXCHANGE.MAIL.queue, async (msg) => {
      if (!msg) return;
      try {
        const { type, payload } = JSON.parse(msg.content.toString());
        await handleSendMail(type, payload);
        channel.ack(msg);
      } catch (error) {
        console.error(
          "[Consumer.mail] Error processing message:",
          error.message,
        );
        channel.nack(msg, false, true); // Requeue on error
      }
    });
  },

  seatExpiration: async () => {
    const channel = getChannel();
    if (!channel) {
      throw new Error("[Consumer.seatExpiration] Channel is not available");
    }
    await channel.consume(EXCHANGE.SEAT_EXPIRATION.queue, async (msg) => {
      if (!msg) return;
      try {
        const { showTimeSeatId, userId } = JSON.parse(msg.content.toString());
        console.log(
          `[Consumer.seatExpiration] Processing seat expiration for seat ${showTimeSeatId}, user ${userId}`,
        );
        await handleSeatExpiration(showTimeSeatId, userId);
        channel.ack(msg);
      } catch (error) {
        console.error(
          "[Consumer.seatExpiration] Error processing message:",
          error.message,
        );
        channel.nack(msg, false, true); // Requeue on error
      }
    });
  },

  deleteCache: async () => {
    const channel = getChannel();
    if (!channel) {
      throw new Error("[Consumer.deleteCache] Channel is not available");
    }
    await channel.consume(EXCHANGE.DELETE_CACHE.queue, async (msg) => {
      if (!msg) return;
      try {
        const { pattern } = JSON.parse(msg.content.toString());
        const deleted = await deleteCacheByPattern(pattern);
        console.log(
          `[Consumer.deleteCache] Deleted ${deleted} cache keys matching: ${pattern}`,
        );
        channel.ack(msg);
      } catch (error) {
        console.error(
          "[Consumer.deleteCache] Error processing message:",
          error.message,
        );
        channel.nack(msg, false, true); // Requeue on error
      }
    });
  },
};
