import supabase from "@supabase/supabase-js";
import { paginate } from "../utils/paginate";

export const create = async (order) => {
  return await supabase.from("orders").insert(order).single();
};

export const findAll = async () => {
  return await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
};

export const findById = async (id) => {
  return await supabase.from("orders").select("*").eq("id", id);
};
export const update = async (id, data) => {
  return await supabase.from("orders").update(data).eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "orders",
    query: query,
    config: {},
    baseFilters: {},
  });
};
