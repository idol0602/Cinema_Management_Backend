import { supabase } from "../config/supabase.js";
import { eventPaginateConfig } from "../config/paginate/event.config.js";
import { paginate } from "../utils/paginate.js";

export const create = async (payload) => {
  return await supabase.from("events").insert(payload).single();
};

export const findAll = async () => {
  return await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
};

export const findById = async (id) => {
  return await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();
};

export const update = async (id, data) => {
  return await supabase.from("events").update(data).eq("id", id);
};

export const remove = async (id) => {
  return await supabase
    .from("events")
    .update({ is_active: false })
    .eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "events",
    query: query,
    config: eventPaginateConfig,
    baseFilters: {},
  });
};
