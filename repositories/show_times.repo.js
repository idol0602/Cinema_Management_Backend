import { supabase } from "../config/supabase.js";
import { showTimePaginateConfig } from "../config/paginate/show_time.config.js";
import { paginate } from "../utils/paginate.js";

export const create = async (payload) =>
  supabase.from("show_times").insert(payload).single();

export const findAll = async () =>
  supabase.from("show_times").select("*").eq("is_active", true);

export const findById = async (id) =>
  supabase
    .from("show_times")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

export const update = async (id, data) =>
  supabase.from("show_times").update(data).eq("id", id);

export const remove = async (id) =>
  supabase.from("show_times").update({ is_active: false }).eq("id", id);

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "show_times",
    query: query,
    config: showTimePaginateConfig,
    baseFilters: {},
  });
};
