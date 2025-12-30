import { supabase } from "../config/supabase.js";

export const create = async (payload) => supabase.from("movie_types").insert(payload).single();

export const findAll = async () => supabase.from("movie_types").select("*");

export const findById = async (id) => supabase.from("movie_types").select("*").eq("id", id).single();

export const update = async (id, data) => supabase.from("movie_types").update(data).eq("id", id);

export const remove = async (id) => supabase.from("movie_types").delete().eq("id", id);
