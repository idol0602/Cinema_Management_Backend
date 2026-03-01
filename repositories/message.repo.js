import { supabase } from "../config/supabase.js";
import { messagePaginateConfig } from "../config/paginate/message.config.js";
import { paginate } from "../utils/paginate.js";

// Các cột của bảng messages:
// id TEXT, conversation_id TEXT, sender_id TEXT,
// content TEXT, type message_type (TEXT | IMAGE),
// image_url TEXT, is_seen BOOLEAN, seen_at TIMESTAMPTZ, created_at TIMESTAMPTZ

// Tạo tin nhắn mới
export const create = async (payload) => {
  return await supabase
    .from("messages")
    .insert(payload)
    .select(
      `*,
      sender:users!messages_sender_id_fkey(id, name, email)`
    )
    .single();
};

// Lấy tin nhắn theo conversation_id (có phân trang offset)
export const findByConversationId = async (
  conversationId,
  limit = 50,
  offset = 0
) => {
  return await supabase
    .from("messages")
    .select(
      `*,
      sender:users!messages_sender_id_fkey(id, name, email)`
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
};

// Lấy tin nhắn theo ID
export const findById = async (id) => {
  return await supabase
    .from("messages")
    .select(
      `*,
      sender:users!messages_sender_id_fkey(id, name, email)`
    )
    .eq("id", id)
    .single();
};

// Đánh dấu đã đọc tất cả tin nhắn chưa đọc trong conversation (của người khác gửi)
export const markAsRead = async (conversationId, userId) => {
  return await supabase
    .from("messages")
    .update({
      is_seen: true,
      seen_at: new Date().toISOString(),
    })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .eq("is_seen", false);
};

// Đếm tin nhắn chưa đọc trong conversation (của người khác gửi)
export const countUnread = async (conversationId, userId) => {
  return await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .eq("is_seen", false);
};

// Lấy tin nhắn cuối cùng của conversation
export const findLastMessage = async (conversationId) => {
  return await supabase
    .from("messages")
    .select(
      `*,
      sender:users!messages_sender_id_fkey(id, name, email)`
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
};

// Thu hồi tin nhắn (xoá nội dung, đổi type sang RECALLED)
export const recallMessage = async (messageId) => {
  return await supabase
    .from("messages")
    .update({
      content: null,
      image_url: null,
      type: "RECALLED",
    })
    .eq("id", messageId)
    .select(
      `*,
      sender:users!messages_sender_id_fkey(id, name, email)`
    )
    .single();
};

// Phân trang
export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "messages",
    query,
    config: messagePaginateConfig,
    baseFilters: {},
    joinTables: {
      "users!messages_sender_id_fkey": "sender_id",
    },
  });
};
