import "dotenv/config";
import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { startSeatExpirationConsumer } from "./consumers/seatExpiration.consumer.js";

const PORT = env.PORT;

const server = http.createServer(app);

server.timeout = 2 * 60 * 1000;
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 130 * 1000;

// Initialize RabbitMQ and start consumer
const initializeRabbitMQ = async () => {
  await connectRabbitMQ();
  await startSeatExpirationConsumer();
};

initializeRabbitMQ().catch((err) => {
  console.error("Failed to initialize RabbitMQ:", err.message);
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
