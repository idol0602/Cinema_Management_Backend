import amqp from "amqplib";
import { EXCHANGE } from "../rabbitmq/exchange.js";
import { Consumer } from "../rabbitmq/consumer.js";

let channel = null;
let connection = null;

export const connectRabbitMQ = async () => {
  try {
    console.log("Connecting to RabbitMQ...");
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    // Handle connection errors and reconnect
    connection.on("error", (err) => {
      console.error("❌ RabbitMQ connection error:", err.message);
      channel = null;
    });
    connection.on("close", () => {
      console.warn("⚠️ RabbitMQ connection closed");
      channel = null;
    });

    console.log("[RabbitMQ] Setting up exchanges and queues...");
    await setup(); // Wait for queues to be declared

    console.log("[RabbitMQ] Starting consumers...");
    await Consumer.ready(); // Then start consumers

    console.log("✅ RabbitMQ connected and ready");
  } catch (error) {
    console.error("❌ RabbitMQ connection error:", error.message);
    console.error(error);
    channel = null; // Reset channel on failure
    connection = null;
    throw error; // Re-throw to let server.js handle it
  }
};

const setup = async () => {
  for (let [_, value] of Object.entries(EXCHANGE)) {
    await channel.assertExchange(value.exchange, value.type, {
      durable: true,
      ...(value.arguments && { arguments: value.arguments }),
    });
    await channel.assertQueue(value.queue, { durable: true });
    await channel.bindQueue(value.queue, value.exchange, value.bindingKey);
  }
};

export const getChannel = () => channel;
