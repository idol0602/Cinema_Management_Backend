import { supabase } from "../config/supabase.js";
import { eventTypePaginateConfig } from "../config/paginate/event_type.config.js";
import { paginate } from "../utils/paginate.js";

export const findByName = async (name) => {
  return await supabase
    .from("event_types")
    .select("*")
    .eq("name", name)
    .eq("is_active", true)
    .single();
};

export const create = async (payload) => {
  return await supabase.from("event_types").insert(payload).select().single();
};

export const findAll = async () => {
  return await supabase
    .from("event_types")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
};

export const findById = async (id) => {
  return await supabase
    .from("event_types")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();
};

export const update = async (id, data) => {
  return await supabase
    .from("event_types")
    .update(data)
    .eq("id", id)
    .select()
    .single();
};

export const remove = async (id) => {
  return await supabase
    .from("event_types")
    .update({ is_active: false })
    .eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "event_types",
    query: query,
    config: eventTypePaginateConfig,
    baseFilters: {},
  });
};
