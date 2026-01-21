import { supabase } from "../config/supabase.js";
import { orderPaginateConfig } from "../config/paginate/order.config.js";
import { paginate } from "../utils/paginate.js";

export const create = async (order) => {
  return await supabase.from("orders").insert(order).single();
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
  return await supabase.from("orders").update(data).eq("id", id);
};

export const remove = async (id) => {
  return await supabase.from("orders").delete().eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "orders",
    query: query,
    config: orderPaginateConfig,
    baseFilters: {},
  });
};
