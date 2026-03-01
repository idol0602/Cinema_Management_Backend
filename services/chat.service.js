import * as conversationRepo from "../repositories/conversation.repo.js";
import * as messageRepo from "../repositories/message.repo.js";
import * as cloudinaryService from "./cloudinary.service.js";
import { CONVERSATION_STATUS } from "../utils/conversationStatus.js";
import { MESSAGE_TYPES } from "../utils/messageTypes.js";
import { v4 as uuidv4 } from "uuid";

// ==================== CONVERSATION ====================

// Customer tạo cuộc hội thoại mới (hoặc trả về cuộc hội thoại hiện có)
export const createConversation = async (customerId) => {
  // Kiểm tra xem customer đã có cuộc hội thoại WAITING/ACTIVE chưa
  const { data: existing } =
    await conversationRepo.findActiveByCustomerId(customerId);
  if (existing) {
    return { data: existing, error: null };
  }

  const payload = {
    id: uuidv4(),
    customer_id: customerId,
    status: CONVERSATION_STATUS.WAITING,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await conversationRepo.create(payload);
  if (error) return { data: null, error };

  // Fetch full conversation with customer info for socket emission
  const { data: fullConversation } = await conversationRepo.findById(data.id);
  return { data: fullConversation || data, error: null };
};

// Lấy cuộc hội thoại theo ID
export const findConversationById = async (id) => {
  const { data, error } = await conversationRepo.findById(id);
  if (error) return { data: null, error };
  return { data, error: null };
};

// Lấy danh sách cuộc hội thoại đang chờ (WAITING) – dành cho staff
export const findWaitingConversations = async () => {
  const { data, error } = await conversationRepo.findWaiting();
  if (error) return { data: null, error };
  return { data, error: null };
};

// Lấy danh sách cuộc hội thoại ACTIVE của một staff
export const findActiveConversationsByStaff = async (staffId) => {
  const { data, error } = await conversationRepo.findActiveByStaffId(staffId);
  if (error) return { data: null, error };
  return { data, error: null };
};

// Lấy cuộc hội thoại của user hiện tại (customer hoặc staff)
export const findConversationsByUserId = async (userId) => {
  const { data, error } = await conversationRepo.findByUserId(userId);
  if (error) return { data: null, error };
  return { data, error: null };
};

// Lấy cuộc hội thoại WAITING/ACTIVE của customer (nếu có)
export const findActiveConversationByCustomer = async (customerId) => {
  const { data, error } =
    await conversationRepo.findActiveByCustomerId(customerId);
  // Không tìm thấy (PGRST116) → trả về null data, không báo lỗi
  if (error && error.code === "PGRST116") return { data: null, error: null };
  if (error) return { data: null, error };
  return { data, error: null };
};

// Staff nhận cuộc hội thoại
export const assignStaff = async (conversationId, staffId) => {
  const { data, error } = await conversationRepo.assignStaff(
    conversationId,
    staffId
  );
  if (error) return { data: null, error };
  if (!data) {
    return {
      data: null,
      error: {
        message:
          "Conversation not found or already assigned",
        code: "NOT_ASSIGNABLE",
      },
    };
  }
  return { data, error: null };
};

// Đóng (soft delete) cuộc hội thoại
export const closeConversation = async (id) => {
  const { data, error } = await conversationRepo.remove(id);
  if (error) return { data: null, error };
  return { data, error: null };
};

// Phân trang cuộc hội thoại
export const paginateConversations = async (query) => {
  return await conversationRepo.findAndPaginate(query);
};

// ==================== MESSAGE ====================

// Gửi tin nhắn text
export const sendMessage = async (
  conversationId,
  senderId,
  content,
  type = MESSAGE_TYPES.TEXT,
  imageUrl = null
) => {
  const payload = {
    id: uuidv4(),
    conversation_id: conversationId,
    sender_id: senderId,
    content: content || null,
    type,
    image_url: imageUrl,
    is_seen: false,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await messageRepo.create(payload);
  if (error) return { data: null, error };

  // Cập nhật updated_at của conversation
  await conversationRepo.update(conversationId, {});

  return { data, error: null };
};

// Gửi tin nhắn kèm ảnh (base64)
export const sendImageMessage = async (
  conversationId,
  senderId,
  base64Image,
  content = ""
) => {
  try {
    const { url } = await cloudinaryService.uploadBase64(
      base64Image,
      "cinema_chat"
    );

    return await sendMessage(
      conversationId,
      senderId,
      content || null,
      MESSAGE_TYPES.IMAGE,
      url
    );
  } catch (err) {
    return {
      data: null,
      error: { message: "Upload image failed: " + err.message },
    };
  }
};

// Lấy tin nhắn của cuộc hội thoại (phân trang offset/limit)
export const getMessages = async (conversationId, limit = 50, offset = 0) => {
  const { data, error } = await messageRepo.findByConversationId(
    conversationId,
    limit,
    offset
  );
  if (error) return { data: null, error };
  return { data, error: null };
};

// Đánh dấu tất cả tin nhắn trong conversation là đã đọc (trừ tin của chính mình)
export const markAsRead = async (conversationId, userId) => {
  const { error } = await messageRepo.markAsRead(conversationId, userId);
  if (error) return { error };
  return { error: null };
};

// Đếm tin nhắn chưa đọc
export const countUnread = async (conversationId, userId) => {
  const { count, error } = await messageRepo.countUnread(
    conversationId,
    userId
  );
  if (error) return { data: null, error };
  return { data: count || 0, error: null };
};

// Lấy tin nhắn cuối cùng của conversation
export const getLastMessage = async (conversationId) => {
  const { data, error } = await messageRepo.findLastMessage(conversationId);
  if (error && error.code === "PGRST116") return { data: null, error: null };
  if (error) return { data: null, error };
  return { data, error: null };
};

// Phân trang tin nhắn
export const paginateMessages = async (query) => {
  return await messageRepo.findAndPaginate(query);
};

// Thu hồi tin nhắn (chỉ cho phép sender thu hồi)
export const recallMessage = async (messageId, userId) => {
  // Tìm message
  const { data: msg, error: findError } = await messageRepo.findById(messageId);
  if (findError) return { data: null, error: findError };
  if (!msg) return { data: null, error: { message: "Message not found" } };

  // Chỉ sender mới được thu hồi
  if (msg.sender_id !== userId) {
    return { data: null, error: { message: "You can only recall your own messages" } };
  }

  // Đã thu hồi rồi
  if (msg.type === "RECALLED") {
    return { data: null, error: { message: "Message already recalled" } };
  }

  const { data, error } = await messageRepo.recallMessage(messageId);
  if (error) return { data: null, error };
  return { data, error: null };
};
