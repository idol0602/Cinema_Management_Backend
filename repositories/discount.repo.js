import { supabase } from "../config/supabase.js";
import { discountPaginateConfig } from "../config/paginate/discount.config.js";
import { paginate } from "../utils/paginate.js";

export const create = async (payload) => {
  return await supabase.from("discounts").insert(payload).single();
};

export const findAll = async () => {
  return await supabase
    .from("discounts")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
};

export const findById = async (id) => {
  return await supabase
    .from("discounts")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();
};

export const update = async (id, data) => {
  return await supabase.from("discounts").update(data).eq("id", id);
};

export const remove = async (id) => {
  return await supabase
    .from("discounts")
    .update({ is_active: false })
    .eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "discounts",
    query: query,
    config: discountPaginateConfig,
    baseFilters: {},
  });
};
