import { supabase } from "../config/supabase.js";
import { movieTypePaginateConfig } from "../config/paginate/movie_type.config.js";
import { paginate } from "../utils/paginate.js";

export const create = async (payload) => {
  return await supabase.from("movie_types").insert(payload).single();
};

export const findAll = async () => {
  return await supabase.from("movie_types").select("*");
};

export const findById = async (id) => {
  return await supabase.from("movie_types").select("*").eq("id", id).single();
};

export const update = async (id, data) => {
  return await supabase.from("movie_types").update(data).eq("id", id);
};

export const remove = async (id) => {
  return await supabase
    .from("movie_types")
    .update({ is_active: false })
    .eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "movie_types",
    query: query,
    config: movieTypePaginateConfig,
    baseFilters: {},
  });
};
