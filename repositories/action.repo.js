import { supabase } from "../config/supabase.js";
import { actionPaginateConfig } from "../config/paginate/action.config.js";
import { paginate } from "../utils/paginate.js";

export const findByPath = async (path, method) => {
  return await supabase
    .from("actions")
    .select("*")
    .eq("path", path)
    .eq("method", method)
    .eq("is_active", true)
    .single();
};

export const create = async (payload) => {
  return await supabase.from("actions").insert(payload).select().single();
};

export const findAll = async () => {
  return await supabase
    .from("actions")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
};

export const findById = async (id) => {
  return await supabase
    .from("actions")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();
};

export const update = async (id, data) => {
  return await supabase
    .from("actions")
    .update(data)
    .eq("id", id)
    .select()
    .single();
};

export const remove = async (id) => {
  return await supabase
    .from("actions")
    .update({ is_active: false })
    .eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "actions",
    query: query,
    config: actionPaginateConfig,
    baseFilters: {},
  });
};
