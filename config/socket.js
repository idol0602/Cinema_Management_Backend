import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "./env.js";
import * as chatService from "../services/chat.service.js";
import * as userService from "../services/user.service.js";

let io;
// {userId: [socketId, socketId]}
const onlineUsers = new Map();
// {userId: timeout}
const offlineTimer = new Map();

const trackingOnline = async (userId,socket) => {
    if(offlineTimer.has(userId)) {
      clearTimeout(offlineTimer.get(userId));
      offlineTimer.delete(userId);
    }

    if(!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());

      await userService.online(userId);
    }

    onlineUsers.get(userId).add(socket.id);

}

const trackingOffline = async (userId,socket) => {
  const userSockets = onlineUsers.get(userId);
      if (!userSockets) return;

      userSockets.delete(socket.id);

      if (userSockets.size > 0) return;

      onlineUsers.delete(userId);
      
      const timeout = setTimeout(async () => {
        if(!onlineUsers.has(userId)) {
          await userService.offline(userId);
        }
        offlineTimer.delete(userId);
      }, 5000);
      offlineTimer.set(userId, timeout);
}

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [process.env.CLIENT_URL, process.env.DASHBOARD_URL],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
  });
  // middleware
  io.use((socket, next) => {
    let token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token && socket.handshake.headers?.cookie) {
      const cookies = socket.handshake.headers.cookie.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.split("=");
        if (key && value) {
            acc[key.trim()] = value;
        }
        return acc;
      }, {});
      token = cookies["access_token"];
    }

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("user connected", socket.user.id);
    const user = socket.user;
    const userId = user.id;
    socket.join(`user:${userId}`);
    trackingOnline(userId,socket);

    socket.on("disconnect", () => {
      console.log("user disconnected", socket.user.id);
      trackingOffline(userId,socket);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }
  return io;
};
