import { supabase } from "../config/supabase.js";
import { rolePaginateConfig } from "../config/paginate/role.config.js";
import { paginate } from "../utils/paginate.js";

export const findByName = async (name) => {
  return await supabase
    .from("roles")
    .select("*")
    .eq("name", name)
    .eq("is_active", true)
    .single();
};

export const create = async (payload) => {
  return await supabase.from("roles").insert(payload).select().single();
};

export const findAll = async () => {
  return await supabase
    .from("roles")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
};

export const findById = async (id) => {
  return await supabase
    .from("roles")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();
};

export const update = async (id, data) => {
  return await supabase
    .from("roles")
    .update(data)
    .eq("id", id)
    .select()
    .single();
};

export const remove = async (id) => {
  return await supabase.from("roles").update({ is_active: false }).eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "roles",
    query: query,
    config: rolePaginateConfig,
    baseFilters: {},
  });
};
