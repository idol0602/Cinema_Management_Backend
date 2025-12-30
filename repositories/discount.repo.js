import { supabase } from "../config/supabase.js";

export const create = async (payload) => supabase.from("discounts").insert(payload).single();

export const findAll = async () => supabase.from("discounts").select("*").eq("is_active", true);

export const findById = async (id) =>
  supabase.from("discounts").select("*").eq("id", id).eq("is_active", true).single();

export const update = async (id, data) => supabase.from("discounts").update(data).eq("id", id);

export const remove = async (id) => supabase.from("discounts").update({ is_active: false }).eq("id", id);
