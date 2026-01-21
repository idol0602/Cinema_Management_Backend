import { supabase } from "../config/supabase.js";
import { ratePaginateConfig } from "../config/paginate/rate.config.js";
import { paginate } from "../utils/paginate.js";

export const create = async (payload) => {
  return await supabase.from("rates").insert(payload).single();
};

export const findAll = async () => {
  return await supabase
    .from("rates")
    .select("*")
    .order("created_at", { ascending: false });
};

export const findById = async (id) => {
  return await supabase.from("rates").select("*").eq("id", id).single();
};

export const update = async (id, data) => {
  return await supabase.from("rates").update(data).eq("id", id);
};

export const remove = async (id) => {
  return await supabase.from("rates").delete().eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "rates",
    query: query,
    config: ratePaginateConfig,
    baseFilters: {},
  });
};
