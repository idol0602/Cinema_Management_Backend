import { supabase } from "../config/supabase.js";
import { messagePaginateConfig } from "../config/paginate/message.config.js";
import { paginate } from "../utils/paginate.js";

// Tạo tin nhắn mới
export const create = async (payload) => {
  return await supabase.from("messages").insert(payload).select().single();
};

// Lấy tin nhắn theo conversation_id (có phân trang)
export const findByConversationId = async (
  conversationId,
  limit = 50,
  offset = 0,
) => {
  return await supabase
    .from("messages")
    .select("*, sender:users!messages_sender_id_fkey(id, name, email)")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
};

// Lấy tin nhắn theo ID
export const findById = async (id) => {
  return await supabase
    .from("messages")
    .select("*, sender:users!messages_sender_id_fkey(id, name, email)")
    .eq("id", id)
    .single();
};

// Đánh dấu đã đọc (sử dụng cho tin nhắn trong 1 cuộc hội thoại cho 1 user)
export const markAsRead = async (conversationId, userId) => {
  return await supabase
    .from("messages")
    .update({ is_seen: true, seen_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .eq("is_seen", false);
};

// Đếm tin nhắn chưa đọc
export const countUnread = async (conversationId, userId) => {
  return await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .eq("is_seen", false);
};

// Paginate
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
