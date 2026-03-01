import * as service from "../services/chat.service.js";
import { success, fail } from "../utils/response.js";

// ==================== CONVERSATION ====================

// Customer tạo cuộc hội thoại (hoặc lấy lại cuộc hội thoại hiện tại)
export const createConversation = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { data, error } = await service.createConversation(customerId);
    if (error) return fail(res, error);
    return success(res, data, "Conversation created successfully", 201);
  } catch (e) {
    next(e);
  }
};

// Lấy cuộc hội thoại theo ID
export const getConversationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await service.findConversationById(id);
    if (error) return fail(res, error);
    return success(res, data, "Get conversation successfully");
  } catch (e) {
    next(e);
  }
};

// Lấy danh sách cuộc hội thoại đang chờ – dành cho staff
export const getWaitingConversations = async (req, res, next) => {
  try {
    const { data, error } = await service.findWaitingConversations();
    if (error) return fail(res, error);
    return success(res, data, "Get waiting conversations successfully");
  } catch (e) {
    next(e);
  }
};

// Lấy danh sách cuộc hội thoại ACTIVE của staff hiện tại
export const getMyActiveConversations = async (req, res, next) => {
  try {
    const staffId = req.user.id;
    const { data, error } =
      await service.findActiveConversationsByStaff(staffId);
    if (error) return fail(res, error);
    return success(res, data, "Get active conversations successfully");
  } catch (e) {
    next(e);
  }
};

// Lấy tất cả cuộc hội thoại của user hiện tại (customer hoặc staff)
export const getMyConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { data, error } = await service.findConversationsByUserId(userId);
    if (error) return fail(res, error);
    return success(res, data, "Get my conversations successfully");
  } catch (e) {
    next(e);
  }
};

// Lấy cuộc hội thoại WAITING/ACTIVE của customer hiện tại (nếu có)
export const getMyActiveConversation = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { data, error } =
      await service.findActiveConversationByCustomer(customerId);
    if (error) return fail(res, error);
    return success(res, data, "Get active conversation successfully");
  } catch (e) {
    next(e);
  }
};

// Staff nhận cuộc hội thoại
export const assignStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const staffId = req.user.id;
    const { data, error } = await service.assignStaff(id, staffId);
    if (error) return fail(res, error);
    return success(res, data, "Conversation assigned successfully");
  } catch (e) {
    next(e);
  }
};

// Đóng cuộc hội thoại (soft delete → status = DELETED)
export const closeConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await service.closeConversation(id);
    if (error) return fail(res, error);
    return success(res, data, "Conversation closed successfully");
  } catch (e) {
    next(e);
  }
};

// ==================== MESSAGE ====================

// Gửi tin nhắn text
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const senderId = req.user.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return fail(res, { message: "Message content is required" }, 400);
    }

    const { data, error } = await service.sendMessage(
      conversationId,
      senderId,
      content.trim()
    );
    if (error) return fail(res, error);
    return success(res, data, "Message sent successfully", 201);
  } catch (e) {
    next(e);
  }
};

// Gửi tin nhắn kèm ảnh (base64)
export const sendImageMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const senderId = req.user.id;
    const { image, content } = req.body;

    if (!image) {
      return fail(res, { message: "Image data is required" }, 400);
    }

    const { data, error } = await service.sendImageMessage(
      conversationId,
      senderId,
      image,
      content || ""
    );
    if (error) return fail(res, error);
    return success(res, data, "Image message sent successfully", 201);
  } catch (e) {
    next(e);
  }
};

// Lấy tin nhắn của cuộc hội thoại
export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const { data, error } = await service.getMessages(
      conversationId,
      limit,
      offset
    );
    if (error) return fail(res, error);
    return success(res, data, "Get messages successfully");
  } catch (e) {
    next(e);
  }
};

// Lấy tin nhắn cuối cùng của cuộc hội thoại
export const getLastMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { data, error } = await service.getLastMessage(conversationId);
    if (error) return fail(res, error);
    return success(res, data, "Get last message successfully");
  } catch (e) {
    next(e);
  }
};

// Đánh dấu tất cả tin nhắn trong conversation là đã đọc
export const markAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const { error } = await service.markAsRead(conversationId, userId);
    if (error) return fail(res, error);
    return success(res, null, "Messages marked as read");
  } catch (e) {
    next(e);
  }
};

// Đếm tin nhắn chưa đọc trong conversation
export const countUnread = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const { data, error } = await service.countUnread(conversationId, userId);
    if (error) return fail(res, error);
    return success(res, data, "Count unread messages successfully");
  } catch (e) {
    next(e);
  }
};
