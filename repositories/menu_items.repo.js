import { supabase } from "../config/supabase.js";
import { menuItemPaginateConfig } from "../config/paginate/menu_item.config.js";
import { paginate } from "../utils/paginate.js";

export const create = async (payload) => {
  return await supabase.from("menu_items").insert(payload).single();
};

export const findAll = async () => {
  return await supabase.from("menu_items").select("*").eq("is_active", true);
};

export const findById = async (id) => {
  return await supabase
    .from("menu_items")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();
};

export const update = async (id, data) => {
  return await supabase.from("menu_items").update(data).eq("id", id);
};

export const remove = async (id) => {
  return await supabase
    .from("menu_items")
    .update({ is_active: false })
    .eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "menu_items",
    query: query,
    config: menuItemPaginateConfig,
    baseFilters: {},
  });
};
