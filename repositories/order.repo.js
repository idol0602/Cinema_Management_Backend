import { supabase } from "../config/supabase.js";
import { orderPaginateConfig } from "../config/paginate/order.config.js";
import { paginate } from "../utils/paginate.js";
import { PAYMENT_STATUS } from "../utils/paymentStatus.js";

export const create = async (order) => {
  return await supabase.from("orders").insert(order).select().single();
};

export const findAll = async () => {
  return await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .order("created_at", { ascending: false });
};

export const findById = async (id) => {
  return await supabase.from("orders").select("*").eq("id", id).single();
};

export const update = async (id, data) => {
  return await supabase.from("orders").update(data).eq("id", id).select().single();
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "orders",
    query: query,
    config: orderPaginateConfig,
    baseFilters: {},
    joinTables: {
      movies: "movie_id",
      users: "user_id",
    },
  });
};

export const getOrderDetails = async (orderId) => {
  return await supabase.rpc("get_order_details", { p_order_id: orderId });
};

export const handleOrderRpc = async (payload) => {
  return await supabase.rpc("handle_order_and_related_data", { p_payload: payload });
};