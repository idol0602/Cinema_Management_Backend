import * as conversationRepo from "../repositories/conversation.repo.js";
import * as messageRepo from "../repositories/message.repo.js";
import * as cloudinaryService from "./cloudinary.service.js";
import { CONVERSATION_STATUS } from "../utils/conversationStatus.js";
import { MESSAGE_TYPES } from "../utils/messageTypes.js";
import { v4 as uuidv4 } from "uuid";

// ==================== CONVERSATION ====================

// Tạo cuộc hội thoại mới (customer gửi yêu cầu chat)
export const createConversation = async (customerId) => {
  // Kiểm tra xem customer đã có cuộc hội thoại đang chờ/active chưa
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
  return { data, error: null };
};

// Lấy cuộc hội thoại theo ID
export const findConversationById = async (id) => {
  const { data, error } = await conversationRepo.findById(id);
  if (error) return { data: null, error };
  return { data, error: null };
};

// Lấy cuộc hội thoại đang chờ
export const findWaitingConversations = async () => {
  const { data, error } = await conversationRepo.findWaiting();
  if (error) return { data: null, error };
  return { data, error: null };
};

// Lấy cuộc hội thoại của user
export const findConversationsByUserId = async (userId) => {
  const { data, error } = await conversationRepo.findByUserId(userId);
  if (error) return { data: null, error };
  return { data, error: null };
};

// Staff nhận cuộc hội thoại
export const assignStaff = async (conversationId, staffId) => {
  const { data, error } = await conversationRepo.assignStaff(
    conversationId,
    staffId,
  );
  if (error) return { data: null, error };
  return { data, error: null };
};

// Đóng (soft delete) cuộc hội thoại
export const closeConversation = async (id) => {
  const { data, error } = await conversationRepo.remove(id);
  if (error) return { data: null, error };
  return { data, error: null };
};

// ==================== MESSAGE ====================

// Gửi tin nhắn text
export const sendMessage = async (
  conversationId,
  senderId,
  content,
  type = MESSAGE_TYPES.TEXT,
  imageUrl = null,
) => {
  const payload = {
    id: uuidv4(),
    conversation_id: conversationId,
    sender_id: senderId,
    content,
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

// Gửi tin nhắn có hình ảnh (base64)
export const sendImageMessage = async (
  conversationId,
  senderId,
  base64Image,
  content = "",
) => {
  try {
    const { url } = await cloudinaryService.uploadBase64(
      base64Image,
      "cinema_chat",
    );

    return await sendMessage(conversationId, senderId, content, MESSAGE_TYPES.IMAGE, url);
  } catch (err) {
    return {
      data: null,
      error: { message: "Upload image failed: " + err.message },
    };
  }
};

// Lấy tin nhắn của cuộc hội thoại
export const getMessages = async (conversationId, limit = 50, offset = 0) => {
  const { data, error } = await messageRepo.findByConversationId(
    conversationId,
    limit,
    offset,
  );
  if (error) return { data: null, error };
  return { data, error: null };
};

// Đánh dấu đã đọc
export const markAsRead = async (conversationId, userId) => {
  const { error } = await messageRepo.markAsRead(conversationId, userId);
  if (error) return { error };
  return { error: null };
};

// Đếm tin nhắn chưa đọc
export const countUnread = async (conversationId, userId) => {
  const { count, error } = await messageRepo.countUnread(
    conversationId,
    userId,
  );
  if (error) return { data: null, error };
  return { data: count || 0, error: null };
};
