import { supabase } from "../config/supabase.js";
import { commentPaginateConfig } from "../config/paginate/comment.config.js";
import { paginate } from "../utils/paginate.js";

export const create = async (payload) => {
  return await supabase.from("comments").insert(payload).single();
};

export const findAll = async () => {
  return await supabase
    .from("comments")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
};

export const findById = async (id) => {
  return await supabase
    .from("comments")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();
};

export const update = async (id, data) => {
  return await supabase.from("comments").update(data).eq("id", id);
};

export const remove = async (id) => {
  return await supabase
    .from("comments")
    .update({ is_active: false })
    .eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "comments",
    query: query,
    config: commentPaginateConfig,
    baseFilters: {},
  });
};
