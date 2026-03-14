import "dotenv/config";
import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { initSocket } from "./config/socket.js";

const PORT = process.env.PORT || env.PORT || 3000;

const server = http.createServer(app);

initSocket(server);

server.timeout = 2 * 60 * 1000;
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 130 * 1000;

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
