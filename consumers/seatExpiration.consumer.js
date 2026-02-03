import { getChannel, SEAT_EXPIRATION_QUEUE } from "../config/rabbitmq.js";
import { redis } from "../config/redis.js";
import { supabase } from "../config/supabase.js";

/**
 * Start consuming seat expiration messages
 */
export const startSeatExpirationConsumer = async () => {
  // Wait a bit for channel to be ready
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const channel = getChannel();

  if (!channel) {
    console.error("❌ Cannot start consumer: RabbitMQ channel not available");
    console.log("⏳ Retrying in 3 seconds...");
    setTimeout(startSeatExpirationConsumer, 3000);
    return;
  }

  console.log(`🎧 Starting consumer on queue: ${SEAT_EXPIRATION_QUEUE}`);

  // Process one message at a time
  channel.prefetch(1);

  channel.consume(
    SEAT_EXPIRATION_QUEUE,
    async (msg) => {
      if (!msg) {
        console.log("⚠️ Consumer received null message");
        return;
      }

      console.log(`📩 MESSAGE RECEIVED! Raw: ${msg.content.toString()}`);

      try {
        const payload = JSON.parse(msg.content.toString());
        const { showTimeSeatId, userId } = payload;

        console.log(`📩 Processing expiration for seat: ${showTimeSeatId}, user: ${userId}`);

        // Check if hold still exists in Redis
        const redisKey = `seat:hold:${showTimeSeatId}`;
        const holdData = await redis.get(redisKey);

        console.log(`🔍 Redis check for ${redisKey}: ${holdData ? "EXISTS" : "NOT FOUND"}`);

        if (holdData) {
          const parsedHold = JSON.parse(holdData);
          console.log(`⏳ Seat ${showTimeSeatId} still held by ${parsedHold.userId === userId ? "same user" : "different user"}, skipping...`);
        } else {
          console.log(`⏰ Seat ${showTimeSeatId} hold expired, resetting to AVAILABLE...`);

          const { data, error } = await supabase
            .from("show_time_seats")
            .update({ status_seat: "AVAILABLE" })
            .eq("id", showTimeSeatId)
            .eq("status_seat", "HOLDING")
            .select();

          if (error) {
            console.error(`❌ Failed to reset seat ${showTimeSeatId}:`, error.message);
          } else {
            console.log(`✅ Seat ${showTimeSeatId} reset to AVAILABLE, affected rows:`, data?.length || 0);
          }
        }

        channel.ack(msg);
        console.log(`✅ Message acknowledged`);
      } catch (error) {
        console.error("❌ Error processing message:", error.message);
        channel.nack(msg, false, false);
      }
    },
    { noAck: false }
  );

  // Check queue status
  const queueInfo = await channel.checkQueue(SEAT_EXPIRATION_QUEUE);
  console.log(`✅ Consumer started on '${SEAT_EXPIRATION_QUEUE}', waiting messages: ${queueInfo.messageCount}, consumers: ${queueInfo.consumerCount}`);
};
