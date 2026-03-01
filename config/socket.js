import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "./env.js";
import * as chatService from "../services/chat.service.js";
import * as userService from "../services/user.service.js";
import * as roleService from "../services/role.service.js";

let io;
// {userId: Set<socketId>}
const onlineUsers = new Map();
// {userId: timeout}
const offlineTimer = new Map();

const STAFF_ROOM = "staff_room";

const trackingOnline = async (userId, socket) => {
  if (offlineTimer.has(userId)) {
    clearTimeout(offlineTimer.get(userId));
    offlineTimer.delete(userId);
  }

  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
    await userService.online(userId);
  }

  onlineUsers.get(userId).add(socket.id);
};

const trackingOffline = async (userId, socket) => {
  const userSockets = onlineUsers.get(userId);
  if (!userSockets) return;

  userSockets.delete(socket.id);

  if (userSockets.size > 0) return;

  onlineUsers.delete(userId);

  const timeout = setTimeout(async () => {
    if (!onlineUsers.has(userId)) {
      await userService.offline(userId);
    }
    offlineTimer.delete(userId);
  }, 5000);
  offlineTimer.set(userId, timeout);
};

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

  // Middleware – xác thực JWT
  io.use((socket, next) => {
    let token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token && socket.handshake.headers?.cookie) {
      const cookies = socket.handshake.headers.cookie
        .split(";")
        .reduce((acc, cookie) => {
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

    // Xác định role
    let isStaff = false;
    try {
      const { data } = await roleService.findById(user.role);
      if (data && data.name !== "Customer") {
        isStaff = true;
      }
    } catch (err) {
      console.error("Failed to get role:", err);
    }

    // Join room theo role
    if (isStaff) {
      socket.join(STAFF_ROOM);
      socket.join(`staff:${userId}`);
    } else {
      socket.join(`customer:${userId}`);
    }

    trackingOnline(userId, socket);

    socket.on("disconnect", () => {
      console.log("user disconnected", userId);
      trackingOffline(userId, socket);
    });

    /* =================================================
        CONVERSATION EVENTS
    ================================================= */

    // Customer tạo cuộc hội thoại + gửi tin nhắn đầu
    socket.on("conversation:create", async (callback) => {
      try {
        const { data, error } = await chatService.createConversation(userId);
        if (error) return callback?.({ error });

        // Customer join conversation room
        socket.join(`conversation:${data.id}`);

        // Thông báo tất cả staff/admin có cuộc hội thoại mới (WAITING)
        io.to(STAFF_ROOM).emit("conversation:new", data);

        callback?.({ data });
      } catch (err) {
        callback?.({ error: err.message });
      }
    });

    // Join conversation room (khi mở chat UI)
    socket.on("conversation:join", ({ conversationId }) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Staff nhận cuộc hội thoại (assign)
    socket.on("conversation:assign", async ({ conversationId }, callback) => {
      try {
        const { data, error } = await chatService.assignStaff(
          conversationId,
          userId
        );

        if (error) return callback?.({ error });

        // Staff join room conversation
        socket.join(`conversation:${conversationId}`);

        // Thông báo cho TẤT CẢ staff (để remove khỏi waiting list nếu đã assigned bởi người khác)
        io.to(STAFF_ROOM).emit("conversation:assigned", data);

        // Thông báo cho customer trong conversation room
        io.to(`conversation:${conversationId}`).emit(
          "conversation:assigned",
          data
        );

        callback?.({ data });
      } catch (err) {
        callback?.({ error: err.message });
      }
    });

    // Đóng (soft delete) cuộc hội thoại
    socket.on("conversation:close", async ({ conversationId }, callback) => {
      try {
        const { error } = await chatService.closeConversation(conversationId);
        if (error) return callback?.({ error });

        // Thông báo cho tất cả trong conversation room
        io.to(`conversation:${conversationId}`).emit(
          "conversation:closed",
          { conversationId }
        );

        // Thông báo cho staff room (để remove khỏi list)
        io.to(STAFF_ROOM).emit("conversation:closed", { conversationId });

        callback?.({ success: true });
      } catch (err) {
        callback?.({ error: err.message });
      }
    });

    // Staff/Admin lấy danh sách cuộc hội thoại đang chờ
    socket.on("conversation:list:waiting", async (callback) => {
      try {
        const { data, error } = await chatService.findWaitingConversations();
        if (error) return callback?.({ error });
        callback?.({ data });
      } catch (err) {
        callback?.({ error: err.message });
      }
    });

    // Lấy danh sách cuộc hội thoại của user hiện tại
    socket.on("conversation:list:mine", async (callback) => {
      try {
        const { data, error } =
          await chatService.findConversationsByUserId(userId);
        if (error) return callback?.({ error });
        callback?.({ data });
      } catch (err) {
        callback?.({ error: err.message });
      }
    });

    // Customer lấy cuộc hội thoại WAITING/ACTIVE hiện tại
    socket.on("conversation:current", async (callback) => {
      try {
        const { data, error } =
          await chatService.findActiveConversationByCustomer(userId);
        if (error) return callback?.({ error });

        // Nếu có conversation, join room
        if (data) {
          socket.join(`conversation:${data.id}`);
        }

        callback?.({ data });
      } catch (err) {
        callback?.({ error: err.message });
      }
    });

    /* =================================================
        MESSAGE EVENTS
    ================================================= */

    // Gửi tin nhắn text
    socket.on("message:send", async ({ conversationId, content }, callback) => {
      try {
        const { data, error } = await chatService.sendMessage(
          conversationId,
          userId,
          content
        );

        if (error) return callback?.({ error });

        // Phát cho tất cả trong conversation room
        io.to(`conversation:${conversationId}`).emit("message:new", data);

        // Nếu conversation đang WAITING → phát cho staff room để hiển thị preview
        const { data: conv } =
          await chatService.findConversationById(conversationId);
        if (conv && conv.status === "WAITING") {
          io.to(STAFF_ROOM).emit("conversation:update", conv);
        }

        callback?.({ data });
      } catch (err) {
        callback?.({ error: err.message });
      }
    });

    // Gửi tin nhắn ảnh (base64)
    socket.on(
      "message:image",
      async ({ conversationId, base64Image, content }, callback) => {
        try {
          const { data, error } = await chatService.sendImageMessage(
            conversationId,
            userId,
            base64Image,
            content
          );

          if (error) return callback?.({ error });

          io.to(`conversation:${conversationId}`).emit("message:new", data);

          callback?.({ data });
        } catch (err) {
          callback?.({ error: err.message });
        }
      }
    );

    // Load lịch sử tin nhắn
    socket.on(
      "message:list",
      async ({ conversationId, limit, offset }, callback) => {
        try {
          const { data, error } = await chatService.getMessages(
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

    // Đánh dấu đã đọc
    socket.on("message:read", async ({ conversationId }, callback) => {
      try {
        const { error } = await chatService.markAsRead(conversationId, userId);
        if (error) return callback?.({ error });

        io.to(`conversation:${conversationId}`).emit("message:read:update", {
          conversationId,
          userId,
        });

        callback?.({ success: true });
      } catch (err) {
        callback?.({ error: err.message });
      }
    });

    // Thu hồi tin nhắn
    socket.on("message:recall", async ({ messageId }, callback) => {
      try {
        const { data, error } = await chatService.recallMessage(
          messageId,
          userId
        );

        if (error) return callback?.({ error });

        // Phát cho tất cả trong conversation room
        io.to(`conversation:${data.conversation_id}`).emit(
          "message:recalled",
          data
        );

        callback?.({ data });
      } catch (err) {
        callback?.({ error: err.message });
      }
    });

    // Đếm tin nhắn chưa đọc
    socket.on(
      "message:unread:count",
      async ({ conversationId }, callback) => {
        try {
          const { data, error } = await chatService.countUnread(
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
