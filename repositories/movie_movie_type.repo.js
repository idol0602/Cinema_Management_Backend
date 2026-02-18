import { supabase } from "../config/supabase.js";
import { paginate } from "../utils/paginate.js";
import { movieMovieTypePaginateConfig } from "../config/paginate/movie_movie_type.config.js";

export const create = async (payload) => {
  return await supabase.from("movie_movie_types").insert(payload).single();
};

export const findAll = async () => {
  return await supabase.from("movie_movie_types").select("*");
};

export const findById = async (id) => {
  return await supabase.from("movie_movie_types").select("*").eq("id", id).single();
};

export const update = async (id, data) => {
  return await supabase.from("movie_movie_types").update(data).eq("id", id);
};

export const remove = async (id) => {
  return await supabase.from("movie_movie_types").delete().eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "movie_movie_types",
    query: query,
    config: movieMovieTypePaginateConfig,
    baseFilters: {},
  });
};
