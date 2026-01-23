import { supabase } from "../config/supabase.js";
import { authorizePaginateConfig } from "../config/paginate/authorize.config.js";
import { paginate } from "../utils/paginate.js";

export const findByRoleAndAction = async (roleId, actionId) => {
  return await supabase
    .from("authorizes")
    .select("*")
    .eq("role_id", roleId)
    .eq("action_id", actionId);
};

export const create = async (payload) => {
  return await supabase.from("authorizes").insert(payload).select().single();
};

export const findAll = async () => {
  return await supabase.from("authorizes").select("*");
};

export const findById = async (id) => {
  return await supabase.from("authorizes").select("*").eq("id", id).single();
};

export const findByRoleId = async (roleId) => {
  return await supabase.from("authorizes").select("*").eq("role_id", roleId);
};

export const update = async (id, data) => {
  return await supabase
    .from("authorizes")
    .update(data)
    .eq("id", id)
    .select()
    .single();
};

export const remove = async (id) => {
  return await supabase.from("authorizes").delete().eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "authorizes",
    query: query,
    config: authorizePaginateConfig,
    baseFilters: {},
  });
};

export const bulkCreate = async (authorizes) => {
  return await supabase.from("authorizes").insert(authorizes);
};

export const bulkRemove = async (authorizeIds) => {
  return await supabase.from("authorizes").delete().in("id", authorizeIds);
};
