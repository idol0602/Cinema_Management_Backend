import { Router } from "express";
import * as controller from "../controllers/chat.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

// ==================== CONVERSATION ====================

// POST   /api/chat/conversations           - Customer tạo cuộc hội thoại (hoặc lấy lại nếu đã có)
router.post("/conversations", auth, controller.createConversation);

// GET    /api/chat/conversations/waiting   - Staff lấy danh sách cuộc hội thoại WAITING
router.get("/conversations/waiting", auth, controller.getWaitingConversations);

// GET    /api/chat/conversations/active    - Staff lấy danh sách cuộc hội thoại ACTIVE của mình
router.get("/conversations/active", auth, controller.getMyActiveConversations);

// GET    /api/chat/conversations/me        - Lấy tất cả cuộc hội thoại của user hiện tại
router.get("/conversations/me", auth, controller.getMyConversations);

// GET    /api/chat/conversations/current   - Customer lấy cuộc hội thoại WAITING/ACTIVE hiện tại
router.get("/conversations/current", auth, controller.getMyActiveConversation);

// GET    /api/chat/conversations/:id       - Lấy cuộc hội thoại theo ID
router.get("/conversations/:id", auth, controller.getConversationById);

// PUT    /api/chat/conversations/:id/assign - Staff nhận cuộc hội thoại
router.put("/conversations/:id/assign", auth, controller.assignStaff);

// PUT    /api/chat/conversations/:id/close  - Đóng cuộc hội thoại (status → DELETED)
router.put("/conversations/:id/close", auth, controller.closeConversation);

// ==================== MESSAGE ====================

// GET    /api/chat/conversations/:conversationId/messages         - Lấy tin nhắn (limit, offset)
router.get(
  "/conversations/:conversationId/messages",
  auth,
  controller.getMessages
);

// POST   /api/chat/conversations/:conversationId/messages         - Gửi tin nhắn text
router.post(
  "/conversations/:conversationId/messages",
  auth,
  controller.sendMessage
);

// POST   /api/chat/conversations/:conversationId/messages/image   - Gửi tin nhắn ảnh (base64)
router.post(
  "/conversations/:conversationId/messages/image",
  auth,
  controller.sendImageMessage
);

// GET    /api/chat/conversations/:conversationId/messages/last    - Lấy tin nhắn cuối cùng
router.get(
  "/conversations/:conversationId/messages/last",
  auth,
  controller.getLastMessage
);

// PUT    /api/chat/conversations/:conversationId/read             - Đánh dấu đã đọc
router.put(
  "/conversations/:conversationId/read",
  auth,
  controller.markAsRead
);

// GET    /api/chat/conversations/:conversationId/unread           - Đếm tin chưa đọc
router.get(
  "/conversations/:conversationId/unread",
  auth,
  controller.countUnread
);

export default router;
