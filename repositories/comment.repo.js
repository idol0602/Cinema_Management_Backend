import { supabase } from "../config/supabase.js";

export const create = async (payload) => supabase.from("comments").insert(payload).single();

export const findAll = async () => supabase.from("comments").select("*").eq("is_active", true);

export const findById = async (id) =>
  supabase.from("comments").select("*").eq("id", id).eq("is_active", true).single();

export const update = async (id, data) => supabase.from("comments").update(data).eq("id", id);

export const remove = async (id) => supabase.from("comments").update({ is_active: false }).eq("id", id);
