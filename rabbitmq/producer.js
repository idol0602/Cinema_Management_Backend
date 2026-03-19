import { EXCHANGE } from "./exchange.js";
import { getChannel } from "../config/rabbitmq.js";

export const Producer = {
  mail: async (data) => {
    const channel = getChannel();
    if (!channel) {
      console.error(
        "[Producer.mail] Channel is not available - RabbitMQ may be disconnected",
      );
      throw new Error(
        "Mail service unavailable. RabbitMQ is not connected. Check server logs.",
      );
    }
    try {
      channel.publish(
        EXCHANGE.MAIL.exchange,
        EXCHANGE.MAIL.bindingKey,
        Buffer.from(JSON.stringify(data)),
      );
      console.log("[Producer.mail] Message published successfully");
    } catch (error) {
      console.error(
        "[Producer.mail] Failed to publish message:",
        error.message,
      );
      throw error;
    }
  },
  seatExpiration: async (data, delayMs) => {
    const channel = getChannel();
    if (!channel) {
      console.error(
        "[Producer.seatExpiration] Channel is not available - RabbitMQ may be disconnected",
      );
      throw new Error(
        "Seat expiration service unavailable. RabbitMQ is not connected. Check server logs.",
      );
    }
    try {
      channel.publish(
        EXCHANGE.SEAT_EXPIRATION.exchange,
        EXCHANGE.SEAT_EXPIRATION.bindingKey,
        Buffer.from(JSON.stringify(data)),
        { headers: { "x-delay": delayMs } },
      );
      console.log(
        "[Producer.seatExpiration] Message published successfully with delay:",
        delayMs,
      );
    } catch (error) {
      console.error(
        "[Producer.seatExpiration] Failed to publish message:",
        error.message,
      );
      throw error;
    }
  },
  deleteCache: async (pattern) => {
    const channel = getChannel();
    if (!channel) {
      console.error(
        "[Producer.deleteCache] Channel is not available - RabbitMQ may be disconnected",
      );
      throw new Error(
        "Cache service unavailable. RabbitMQ is not connected. Check server logs.",
      );
    }
    try {
      channel.publish(
        EXCHANGE.DELETE_CACHE.exchange,
        EXCHANGE.DELETE_CACHE.bindingKey,
        Buffer.from(JSON.stringify({ pattern })),
      );
      console.log("[Producer.deleteCache] Message published successfully");
    } catch (error) {
      console.error(
        "[Producer.deleteCache] Failed to publish message:",
        error.message,
      );
      throw error;
    }
  },
};
