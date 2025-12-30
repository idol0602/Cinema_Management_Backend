import { supabase } from "../config/supabase.js";

export const create = async (payload) => supabase.from("combos_events").insert(payload).single();

export const findAll = async () => supabase.from("combos_events").select("*");

export const findById = async (id) => supabase.from("combos_events").select("*").eq("id", id).single();

export const update = async (id, data) => supabase.from("combos_events").update(data).eq("id", id);

export const remove = async (id) => supabase.from("combos_events").delete().eq("id", id);
