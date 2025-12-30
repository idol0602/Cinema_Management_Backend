import { supabase } from "../config/supabase.js";

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
