import { supabase } from "../config/supabase.js";
import { conversationPaginateConfig } from "../config/paginate/conversation.config.js";
import { paginate } from "../utils/paginate.js";
import { CONVERSATION_STATUS } from "../utils/conversationStatus.js";

// Tạo cuộc hội thoại mới
export const create = async (payload) => {
  return await supabase.from("conversations").insert(payload).select().single();
};

// Lấy cuộc hội thoại theo ID (kèm thông tin customer và staff)
export const findById = async (id) => {
  return await supabase
    .from("conversations")
    .select(
      "*, customer:users!conversations_customer_id_fkey(*), staff:users!conversations_staff_id_fkey(*)",
    )
    .eq("id", id)
    .neq("status", CONVERSATION_STATUS.DELETED)
    .single();
};

// Lấy tất cả cuộc hội thoại đang chờ (WAITING)
export const findWaiting = async () => {
  return await supabase
    .from("conversations")
    .select(
      "*, customer:users!conversations_customer_id_fkey(id, name, email, phone)",
    )
    .eq("status", CONVERSATION_STATUS.WAITING)
    .order("created_at", { ascending: true });
};

// Lấy cuộc hội thoại của user (customer hoặc staff)
export const findByUserId = async (userId) => {
  return await supabase
    .from("conversations")
    .select(
      "*, customer:users!conversations_customer_id_fkey(id, name, email), staff:users!conversations_staff_id_fkey(id, name, email)",
    )
    .or(`customer_id.eq.${userId},staff_id.eq.${userId}`)
    .neq("status", CONVERSATION_STATUS.DELETED)
    .order("updated_at", { ascending: false });
};

// Lấy cuộc hội thoại active của customer (nếu có)
export const findActiveByCustomerId = async (customerId) => {
  return await supabase
    .from("conversations")
    .select(
      "*, customer:users!conversations_customer_id_fkey(id, name, email), staff:users!conversations_staff_id_fkey(id, name, email)",
    )
    .eq("customer_id", customerId)
    .in("status", [CONVERSATION_STATUS.WAITING, CONVERSATION_STATUS.ACTIVE])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
};

// Cập nhật cuộc hội thoại
export const update = async (id, data) => {
  return await supabase
    .from("conversations")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
};

// Staff nhận cuộc hội thoại
export const assignStaff = async (conversationId, staffId) => {
  return await supabase
    .from("conversations")
    .update({
      staff_id: staffId,
      status: CONVERSATION_STATUS.ACTIVE,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId)
    .eq("status", CONVERSATION_STATUS.WAITING)
    .select()
    .single();
};

// Soft delete cuộc hội thoại
export const remove = async (id) => {
  return await supabase
    .from("conversations")
    .update({ status: CONVERSATION_STATUS.DELETED, updated_at: new Date().toISOString() })
    .eq("id", id);
};

// Paginate
export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "conversations",
    query,
    config: conversationPaginateConfig,
    baseFilters: {},
    joinTables: {
      "users!conversations_customer_id_fkey": "customer_id",
      "users!conversations_staff_id_fkey": "staff_id",
    },
  });
};
