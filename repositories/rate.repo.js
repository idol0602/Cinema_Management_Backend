import { supabase } from "../config/supabase.js";

export const create = async (payload) => supabase.from("rates").insert(payload).single();

export const findAll = async () => supabase.from("rates").select("*");

export const findById = async (id) => supabase.from("rates").select("*").eq("id", id).single();

export const update = async (id, data) => supabase.from("rates").update(data).eq("id", id);

export const remove = async (id) => supabase.from("rates").delete().eq("id", id);
