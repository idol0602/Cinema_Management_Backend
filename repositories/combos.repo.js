import { supabase } from "../config/supabase.js";
import { comboPaginateConfig } from "../config/paginate/combo.config.js";
import { paginate } from "../utils/paginate.js";

export const create = async (combo) =>
  supabase.from("combos").insert(combo).single();

export const findAll = async () =>
  supabase.from("combos").select("*").eq("is_active", true);

export const findById = async (id) =>
  supabase
    .from("combos")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

export const update = async (id, data) =>
  supabase.from("combos").update(data).eq("id", id);

export const remove = async (id) =>
  supabase.from("combos").update({ is_active: false }).eq("id", id);

export const findAndPaginate = async (query) => {
  return await paginate(supabase, "combos", query, comboPaginateConfig, {
    is_active: true,
  });
};
