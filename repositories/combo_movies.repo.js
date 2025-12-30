import { supabase } from "../config/supabase.js";

export const create = async (payload) => supabase.from("combo_movies").insert(payload).single();

export const findAll = async () => supabase.from("combo_movies").select("*");

export const findById = async (id) => supabase.from("combo_movies").select("*").eq("id", id).single();

export const update = async (id, data) => supabase.from("combo_movies").update(data).eq("id", id);

export const remove = async (id) => supabase.from("combo_movies").delete().eq("id", id);
