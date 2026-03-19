import amqp from "amqplib";
import { EXCHANGE } from "../rabbitmq/exchange.js";
import { Consumer } from "../rabbitmq/consumer.js";

let channel = null;
let connection = null;
let reconnectAttempts = 0;
let isConnecting = false;
let readyPromise = null;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 3000; // 3 seconds

// Check if channel is actually alive (not just non-null)
const isChannelAlive = () => {
  return (
    channel &&
    connection &&
    !connection.closed &&
    connection.connection !== null
  );
};

// Mechanism to wait for channel to be ready
const waitForChannel = async (maxWaitMs = 60000) => {
  const startTime = Date.now();
  while (!isChannelAlive() && Date.now() - startTime < maxWaitMs) {
    if (readyPromise) {
      try {
        await readyPromise;
        if (isChannelAlive()) return channel;
      } catch (error) {
        console.warn("[RabbitMQ] Waiting for reconnect...");
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500)); // Check every 500ms
  }
  if (!isChannelAlive()) {
    throw new Error(
      "RabbitMQ channel is unavailable after waiting. Connection may be failing.",
    );
  }
  return channel;
};

export const connectRabbitMQ = async () => {
  if (isConnecting) {
    console.log("[RabbitMQ] Connection already in progress, waiting...");
    if (readyPromise) await readyPromise;
    return;
  }

  isConnecting = true;
  readyPromise = (async () => {
    try {
      console.log("Connecting to RabbitMQ...");
      const url = process.env.RABBITMQ_URL;
      if (!url) {
        throw new Error(
          "RABBITMQ_URL environment variable is not set. Check your .env file or Render environment variables.",
        );
      }

      connection = await amqp.connect(url);
      channel = await connection.createChannel();
      reconnectAttempts = 0; // Reset on successful connection

      // Handle connection errors - attempt reconnect
      connection.on("error", (err) => {
        console.error("❌ RabbitMQ connection error:", err.message);
        // Reset channel and connection immediately
        channel = null;
        connection = null;
        attemptReconnect();
      });

      connection.on("close", () => {
        console.warn("⚠️ RabbitMQ connection closed");
        // Reset channel and connection immediately
        channel = null;
        connection = null;
        attemptReconnect();
      });

      console.log("[RabbitMQ] Setting up exchanges and queues...");
      await setup(); // Wait for queues to be declared

      console.log("[RabbitMQ] Starting consumers...");
      await Consumer.ready(); // Then start consumers

      console.log("✅ RabbitMQ connected and ready");
      isConnecting = false;
    } catch (error) {
      console.error("❌ RabbitMQ connection error:", error.message);
      console.error(error);
      channel = null; // Reset channel on failure
      connection = null;
      isConnecting = false;
      throw error; // Re-throw to let server.js handle it
    }
  })();

  await readyPromise;
};

const attemptReconnect = async () => {
  // Prevent multiple simultaneous reconnect attempts
  if (isConnecting) {
    console.log(
      "[RabbitMQ] Reconnect already in progress, skipping duplicate attempt",
    );
    return;
  }

  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error(
      "❌ Max reconnection attempts reached. Manual restart required.",
    );
    channel = null;
    connection = null;
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
  return isChannelAlive();
};

export { waitForChannel };
export { isChannelAlive };
