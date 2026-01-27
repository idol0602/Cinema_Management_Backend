import "dotenv/config";
import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";

const PORT = env.PORT;

const server = http.createServer(app);

// ⏱️ TĂNG TIMEOUT
server.timeout = 2 * 60 * 1000;        // 120s - socket timeout
server.keepAliveTimeout = 120 * 1000; // keep-alive
server.headersTimeout = 130 * 1000;   // MUST > keepAliveTimeout

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
