import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "./env.js";
import * as chatService from "../services/chat.service.js";
import * as userService from "../services/user.service.js";
import * as roleService from "../services/role.service.js";

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
    const {data, error} = await roleService.findById(user.role);

    if(data.name === "Customer") {
      socket.join(`customer:${userId}`);
    } else {
      socket.join(`staff:${userId}`);
    }

    trackingOnline(userId,socket);

    socket.on("disconnect", () => {
      console.log("user disconnected", socket.user.id);
      trackingOffline(userId,socket);
    });

    // customer tạo chat
    socket.on("conversation:create", async (callback) => {
      try {
        const { data, error } =
          await chatService.createConversation(userId);

        if (error) return callback?.({ error });

        socket.join(`conversation:${data.id}`);

        // báo staff có chat mới
        io.to("staff").emit("conversation:new", data);

        callback?.({ data });
      } catch (err) {
        callback?.({ error: err.message });
      }
    });

    // join conversation khi mở chat UI
    socket.on("conversation:join", ({ conversationId }) => {
      socket.join(`conversation:${conversationId}`);
    });

    // staff nhận chat
    socket.on(
      "conversation:assign",
      async ({ conversationId }, callback) => {
        try {
          const { data, error } =
            await chatService.assignStaff(
              conversationId,
              userId
            );

          if (error) return callback?.({ error });

          socket.join(`conversation:${conversationId}`);

          io.to(`conversation:${conversationId}`).emit(
            "conversation:assigned",
            data
          );

          callback?.({ data });
        } catch (err) {
          callback?.({ error: err.message });
        }
      }
    );

    // đóng chat
    socket.on(
      "conversation:close",
      async ({ conversationId }, callback) => {
        try {
          const { error } =
            await chatService.closeConversation(conversationId);

          if (error) return callback?.({ error });

          io.to(`conversation:${conversationId}`).emit(
            "conversation:closed"
          );

          callback?.({ success: true });
        } catch (err) {
          callback?.({ error: err.message });
        }
      }
    );

    /* =================================================
        MESSAGE EVENTS
    ================================================= */

    // gửi text message
    socket.on(
      "message:send",
      async ({ conversationId, content }, callback) => {
        try {
          const { data, error } =
            await chatService.sendMessage(
              conversationId,
              userId,
              content
            );

          if (error) return callback?.({ error });

          io.to(`conversation:${conversationId}`).emit(
            "message:new",
            data
          );

          callback?.({ data });
        } catch (err) {
          callback?.({ error: err.message });
        }
      }
    );

    // gửi image
    socket.on(
      "message:image",
      async (
        { conversationId, base64Image, content },
        callback
      ) => {
        try {
          const { data, error } =
            await chatService.sendImageMessage(
              conversationId,
              userId,
              base64Image,
              content
            );

          if (error) return callback?.({ error });

          io.to(`conversation:${conversationId}`).emit(
            "message:new",
            data
          );

          callback?.({ data });
        } catch (err) {
          callback?.({ error: err.message });
        }
      }
    );

    // load message history
    socket.on(
      "message:list",
      async ({ conversationId, limit, offset }, callback) => {
        try {
          const { data, error } =
            await chatService.getMessages(
              conversationId,
              limit,
              offset
            );

          if (error) return callback?.({ error });

          callback?.({ data });
        } catch (err) {
          callback?.({ error: err.message });
        }
      }
    );

    // mark read
    socket.on(
      "message:read",
      async ({ conversationId }, callback) => {
        try {
          const { error } =
            await chatService.markAsRead(
              conversationId,
              userId
            );

          if (error) return callback?.({ error });

          io.to(`conversation:${conversationId}`).emit(
            "message:read:update",
            {
              conversationId,
              userId,
            }
          );

          callback?.({ success: true });
        } catch (err) {
          callback?.({ error: err.message });
        }
      }
    );

    // unread count
    socket.on(
      "message:unread:count",
      async ({ conversationId }, callback) => {
        try {
          const { data, error } =
            await chatService.countUnread(
              conversationId,
              userId
            );

          if (error) return callback?.({ error });

          callback?.({ count: data });
        } catch (err) {
          callback?.({ error: err.message });
        }
      }
    );
    });
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }
  return io;
};
