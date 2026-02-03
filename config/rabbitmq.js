import "dotenv/config";
import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL;

// Queue configuration
export const SEAT_EXPIRATION_QUEUE = "seat_expiration_queue_v2";
const SEAT_DELAY_QUEUE = "seat_delay_queue_v2";
const SEAT_EXCHANGE = "seat_exchange_v2";

let connection = null;
let channel = null;

/**
 * Connect to RabbitMQ and setup delayed queue using DLX
 */
export const connectRabbitMQ = async () => {
  try {
    console.log("🐰 Connecting to RabbitMQ...");
    console.log("🔗 URL:", RABBITMQ_URL ? "Set (hidden)" : "NOT SET!");
    
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    console.log("📡 Channel created");

    // Create main exchange
    await channel.assertExchange(SEAT_EXCHANGE, "direct", { durable: true });
    console.log(`✅ Exchange '${SEAT_EXCHANGE}' created`);

    // Create the processing queue (where expired messages go)
    const processingQueue = await channel.assertQueue(SEAT_EXPIRATION_QUEUE, {
      durable: true,
    });
    console.log(`✅ Processing queue '${SEAT_EXPIRATION_QUEUE}' created, messages: ${processingQueue.messageCount}`);
    
    await channel.bindQueue(SEAT_EXPIRATION_QUEUE, SEAT_EXCHANGE, "expired");
    console.log(`✅ Bound '${SEAT_EXPIRATION_QUEUE}' to exchange with key 'expired'`);

    // Create delay queue with DLX pointing to processing queue
    const delayQueue = await channel.assertQueue(SEAT_DELAY_QUEUE, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": SEAT_EXCHANGE,
        "x-dead-letter-routing-key": "expired",
      },
    });
    console.log(`✅ Delay queue '${SEAT_DELAY_QUEUE}' created, messages: ${delayQueue.messageCount}`);

    console.log("✅ RabbitMQ connected and queues setup complete");

    // Handle connection close
    connection.on("close", () => {
      console.log("⚠️ RabbitMQ connection closed");
    });

    connection.on("error", (err) => {
      console.error("❌ RabbitMQ connection error:", err.message);
    });

    return { connection, channel };
  } catch (error) {
    console.error("❌ Failed to connect to RabbitMQ:", error.message);
    console.error("❌ Full error:", error);
    setTimeout(connectRabbitMQ, 5000);
  }
};

/**
 * Publish a delayed message for seat expiration
 */
export const publishSeatExpirationDLX = async (payload, delayMs) => {
  try {
    if (!channel) {
      console.error("❌ RabbitMQ channel not available");
      return false;
    }

    const message = Buffer.from(JSON.stringify(payload));
    
    // Send to delay queue with per-message TTL
    const sent = channel.sendToQueue(SEAT_DELAY_QUEUE, message, {
      persistent: true,
      expiration: delayMs.toString(),
    });

    console.log(`📤 Published to ${SEAT_DELAY_QUEUE}: ${payload.showTimeSeatId}, TTL: ${delayMs}ms, sent: ${sent}`);
    
    // Check queue status
    const queueInfo = await channel.checkQueue(SEAT_DELAY_QUEUE);
    console.log(`📊 Delay queue status: ${queueInfo.messageCount} messages, ${queueInfo.consumerCount} consumers`);
    
    return sent;
  } catch (error) {
    console.error("❌ Failed to publish:", error.message);
    return false;
  }
};

/**
 * Get the channel for consumers
 */
export const getChannel = () => channel;

/**
 * Close RabbitMQ connection
 */
export const closeRabbitMQ = async () => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log("🐰 RabbitMQ connection closed");
  } catch (error) {
    console.error("❌ Error closing RabbitMQ:", error.message);
  }
};
