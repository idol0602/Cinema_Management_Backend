import amqp from "amqplib";
import { EXCHANGE } from "../rabbitmq/exchange.js";
import { Consumer } from "../rabbitmq/consumer.js";

let channel = null;
let connection = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000; // 5 seconds

export const connectRabbitMQ = async () => {
  try {
    console.log("Connecting to RabbitMQ...");
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    reconnectAttempts = 0; // Reset on successful connection

    // Handle connection errors - attempt reconnect
    connection.on("error", (err) => {
      console.error("❌ RabbitMQ connection error:", err.message);
      channel = null;
      attemptReconnect();
    });

    connection.on("close", () => {
      console.warn("⚠️ RabbitMQ connection closed");
      channel = null;
      attemptReconnect();
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

const attemptReconnect = async () => {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error(
      "❌ Max reconnection attempts reached. Manual restart required.",
    );
    return;
  }

  reconnectAttempts++;
  console.log(
    `⏳ Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${RECONNECT_DELAY}ms...`,
  );

  setTimeout(async () => {
    try {
      await connectRabbitMQ();
    } catch (error) {
      console.error("Reconnection failed:", error.message);
      attemptReconnect();
    }
  }, RECONNECT_DELAY);
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

export const isRabbitMQConnected = () => {
  return channel !== null && connection !== null;
};
