import { EXCHANGE } from "./exchange.js";
import { getChannel } from "../config/rabbitmq.js";

export const Producer = {
  mail: async (data) => {
    const channel = getChannel();
    if (!channel) {
      throw new Error(
        "RabbitMQ channel is not initialized. Ensure connectRabbitMQ() has completed.",
      );
    }
    channel.publish(
      EXCHANGE.MAIL.exchange,
      EXCHANGE.MAIL.bindingKey,
      Buffer.from(JSON.stringify(data)),
    );
  },
  seatExpiration: async (data, delayMs) => {
    const channel = getChannel();
    if (!channel) {
      throw new Error(
        "RabbitMQ channel is not initialized. Ensure connectRabbitMQ() has completed.",
      );
    }
    channel.publish(
      EXCHANGE.SEAT_EXPIRATION.exchange,
      EXCHANGE.SEAT_EXPIRATION.bindingKey,
      Buffer.from(JSON.stringify(data)),
      { headers: { "x-delay": delayMs } },
    );
  },
  deleteCache: async (pattern) => {
    const channel = getChannel();
    if (!channel) {
      throw new Error(
        "RabbitMQ channel is not initialized. Ensure connectRabbitMQ() has completed.",
      );
    }
    channel.publish(
      EXCHANGE.DELETE_CACHE.exchange,
      EXCHANGE.DELETE_CACHE.bindingKey,
      Buffer.from(JSON.stringify({ pattern })),
    );
  },
};
