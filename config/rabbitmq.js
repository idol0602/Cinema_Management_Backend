import amqp from "amqplib";
import { EXCHANGE } from "../rabbitmq/exchange.js";
import { Consumer } from "../rabbitmq/consumer.js";

let channel = null;
let connection = null;
let reconnectAttempts = 0;
let isConnecting = false;
let readyPromise = null;
let reconnectTimer = null;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 3000; // 3 seconds
const RECONNECT_COOLDOWN = 30000; // 30 seconds after max attempts

// Check if channel is actually alive (not just non-null)
const isChannelAlive = () => {
  // Simple check: if channel is null, it means connection was reset
  // amqplib will auto-close channel if connection dies
  return channel !== null && connection !== null;
};

// Mechanism to wait for channel to be ready
const waitForChannel = async (maxWaitMs = 60000) => {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    // If channel is alive, return it immediately
    if (isChannelAlive()) {
      return channel;
    }

    // If reconnect is in progress, wait for it with timeout
    if (readyPromise && isConnecting) {
      try {
        await Promise.race([
          readyPromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Reconnect timeout")), 5000),
          ),
        ]);
        // After reconnect completes, check again
        if (isChannelAlive()) {
          return channel;
        }
      } catch (error) {
        console.warn(`[RabbitMQ] Reconnect wait failed: ${error.message}`);
        // Continue waiting, reconnect will retry
      }
    } else {
      // No active reconnect: proactively start one so requests don't just timeout.
      attemptReconnect();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // Timeout reached
  throw new Error(
    `RabbitMQ channel is unavailable after waiting ${maxWaitMs}ms. Connection may be failing or reconnect attempts exhausted.`,
  );
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

      connection = await amqp.connect(url, {
        heartbeat: 30,
        clientProperties: {
          connection_name: "cinema-backend-render",
        },
      });
      channel = await connection.createChannel();
      reconnectAttempts = 0; // Reset on successful connection
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      // Handle connection errors - attempt reconnect
      connection.on("error", (err) => {
        console.error("❌ RabbitMQ connection error:", err.message);
        // Reset channel and connection immediately
        channel = null;
        connection = null;
        // Reset isConnecting flag so reconnect can actually happen
        isConnecting = false;
        attemptReconnect();
      });

      connection.on("close", () => {
        console.warn("⚠️ RabbitMQ connection closed");
        // Reset channel and connection immediately
        channel = null;
        connection = null;
        // Reset isConnecting flag so reconnect can actually happen
        isConnecting = false;
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
      channel = null; // Reset channel on failure
      connection = null;
      isConnecting = false; // CRITICAL: Reset flag so reconnect can retry
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

  // If channel somehow got fixed during the check, don't reconnect
  if (isChannelAlive()) {
    console.log("[RabbitMQ] Channel is alive, no reconnect needed");
    return;
  }

  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error(
      "❌ Max reconnection attempts reached. Entering cooldown before retry.",
    );
    channel = null;
    connection = null;
    isConnecting = false;

    // Do not deadlock forever; retry again after cooldown.
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        reconnectAttempts = 0;
        attemptReconnect();
      }, RECONNECT_COOLDOWN);
    }
    return;
  }

  reconnectAttempts++;
  console.log(
    `⏳ Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${RECONNECT_DELAY}ms...`,
  );

  if (reconnectTimer) {
    return;
  }

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
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
