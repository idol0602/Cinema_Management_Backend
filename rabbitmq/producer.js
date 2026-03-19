import { EXCHANGE } from "./exchange.js";
import { getChannel } from "../config/rabbitmq.js";

const publishWithRetry = async (
  exchange,
  bindingKey,
  data,
  options = {},
  maxRetries = 5,
) => {
  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const channel = getChannel();
      if (!channel) {
        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s, 8s, 16s
          const delayMs = 1000 * Math.pow(2, attempt);
          console.warn(
            `[Producer] Channel unavailable, waiting ${delayMs}ms before retry (${attempt + 1}/${maxRetries})...`,
          );
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }
        throw new Error("RabbitMQ channel is unavailable");
      }

      channel.publish(exchange, bindingKey, data, options);
      console.log(
        `[Producer] Message published successfully (attempt ${attempt + 1}/${maxRetries + 1})`,
      );
      return true;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delayMs = 1000 * Math.pow(2, attempt);
        console.warn(
          `[Producer] Publish attempt ${attempt + 1} failed: ${error.message}. Waiting ${delayMs}ms before retry...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
};

export const Producer = {
  mail: async (data) => {
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
