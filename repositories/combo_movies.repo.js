import { supabase } from "../config/supabase.js";
import { comboMoviePaginateConfig } from "../config/paginate/combo_movie.config.js";
import { paginate } from "../utils/paginate.js";

export const create = async (payload) => {
  return await supabase.from("combo_movies").insert(payload).single();
};

export const findAll = async () => {
  return await supabase.from("combo_movies").select("*");
};

export const findById = async (id) => {
  return await supabase.from("combo_movies").select("*").eq("id", id).single();
};

export const update = async (id, data) => {
  return await supabase.from("combo_movies").update(data).eq("id", id);
};

export const remove = async (id) => {
  return await supabase.from("combo_movies").delete().eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "combo_movies",
    query: query,
    config: comboMoviePaginateConfig,
    baseFilters: {},
  });
};
