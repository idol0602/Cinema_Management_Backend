import { supabase } from "../config/supabase.js";

export const create = async (payload) => supabase.from("tickets").insert(payload).single();

export const findAll = async () => supabase.from("tickets").select("*");

export const findById = async (id) => supabase.from("tickets").select("*").eq("id", id).single();

export const update = async (id, data) => supabase.from("tickets").update(data).eq("id", id);

export const remove = async (id) => supabase.from("tickets").delete().eq("id", id);
