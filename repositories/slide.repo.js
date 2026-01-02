import { supabase } from "../config/supabase.js";
import { slidePaginateConfig } from "../config/paginate/slide.config.js";
import { paginate } from "../utils/paginate.js";

export const create = async (payload) =>
  supabase.from("slides").insert(payload).single();

export const findAll = async () =>
  supabase.from("slides").select("*").eq("is_active", true);

export const findById = async (id) =>
  supabase
    .from("slides")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

export const update = async (id, data) =>
  supabase.from("slides").update(data).eq("id", id);

export const remove = async (id) =>
  supabase.from("slides").update({ is_active: false }).eq("id", id);

export const findAndPaginate = async (query) => {
  return await paginate(supabase, "slides", query, slidePaginateConfig, {
    is_active: true,
  });
};
