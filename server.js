import "dotenv/config";
import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { initSocket } from "./config/socket.js";
import { connectRabbitMQ, isRabbitMQConnected } from "./config/rabbitmq.js";

const PORT = process.env.PORT || env.PORT || 3000;

const server = http.createServer(app);

initSocket(server);

server.timeout = 2 * 60 * 1000;
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 130 * 1000;

// Ensure RabbitMQ is connected before starting the server
(async () => {
  try {
    await connectRabbitMQ();

    // Wait additional 2 seconds to ensure all consumers are truly ready
    console.log("⏳ Waiting for RabbitMQ consumers to fully initialize...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify connection is stable
    if (!isRabbitMQConnected()) {
      throw new Error(
        "RabbitMQ connection was lost immediately after setup. Check your connection string and network.",
      );
    }

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`✅ RabbitMQ fully initialized and ready`);
    });
  } catch (error) {
    console.error(
      "❌ Failed to connect to RabbitMQ, exiting...",
      error.message,
    );
    console.error(error);
    process.exit(1);
  }
})();
