import { supabase } from "../config/supabase.js";
import { seatTypePaginateConfig } from "../config/paginate/seat_type.config.js";
import { paginate } from "../utils/paginate.js";

export const findByName = async (name) => {
  return await supabase
    .from("seat_types")
    .select("*")
    .eq("name", name)
    .eq("is_active", true)
    .single();
};

export const create = async (payload) => {
  return await supabase.from("seat_types").insert(payload).select().single();
};

export const findAll = async () => {
  return await supabase
    .from("seat_types")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
};

export const findById = async (id) => {
  return await supabase
    .from("seat_types")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();
};

export const update = async (id, data) => {
  return await supabase
    .from("seat_types")
    .update(data)
    .eq("id", id)
    .select()
    .single();
};

export const remove = async (id) => {
  return await supabase
    .from("seat_types")
    .update({ is_active: false })
    .eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "seat_types",
    query: query,
    config: seatTypePaginateConfig,
    baseFilters: {},
  });
};
