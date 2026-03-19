import { EXCHANGE } from "./exchange.js";
import { getChannel } from "../config/rabbitmq.js";

const publishWithRetry = async (
  exchange,
  bindingKey,
  data,
  options = {},
  maxRetries = 1,
) => {
  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const channel = getChannel();
      if (!channel) {
        if (attempt < maxRetries) {
          console.warn(
            `[Producer] Channel unavailable, waiting 1s before retry (${attempt + 1}/${maxRetries})...`,
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        throw new Error("RabbitMQ channel is unavailable");
      }

      channel.publish(exchange, bindingKey, data, options);
      return true;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        console.warn(
          `[Producer] Publish attempt ${attempt + 1} failed: ${error.message}. Retrying...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError;
};

export const Producer = {
  mail: async (data) => {
    const channel = getChannel();
    if (!channel) {
      console.error(
        "[Producer.mail] Channel is not available - RabbitMQ disconnected or not initialized",
      );
      throw new Error(
        "Mail service unavailable. RabbitMQ is not connected. Check server logs.",
      );
    }
    try {
      await publishWithRetry(
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
        "[Producer.seatExpiration] Channel is not available - RabbitMQ disconnected or not initialized",
      );
      throw new Error(
        "Seat expiration service unavailable. RabbitMQ is not connected. Check server logs.",
      );
    }
    try {
      await publishWithRetry(
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
        "[Producer.deleteCache] Channel is not available - RabbitMQ disconnected or not initialized",
      );
      throw new Error(
        "Cache service unavailable. RabbitMQ is not connected. Check server logs.",
      );
    }
    try {
      await publishWithRetry(
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
