import { supabase } from "../config/supabase.js";
import { moviePaginateConfig } from "../config/paginate/movie.config.js";
import { paginate } from "../utils/paginate.js";

export const create = async (movie) => {
  return await supabase.from("movies").insert(movie).single();
};

export const findAll = async () => {
  return await supabase.from("movies").select("*").eq("is_active", true);
};

export const findById = async (id) => {
  return await supabase
    .from("movies")
    .select("*")
    .eq("id", id)
    .eq("is_active", true);
};
export const update = async (id, data) => {
  return await supabase.from("movies").update(data).eq("id", id);
};

export const remove = async (id) => {
  return await supabase
    .from("movies")
    .update({
      is_active: false,
    })
    .eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate(supabase, "movies", query, moviePaginateConfig, {
    is_active: true,
  });
};
