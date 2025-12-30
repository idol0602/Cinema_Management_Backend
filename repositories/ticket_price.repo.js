import { supabase } from "../config/supabase.js";

export const create = async (payload) => supabase.from("ticket_prices").insert(payload).single();

export const findAll = async () => supabase.from("ticket_prices").select("*");

export const findById = async (id) => supabase.from("ticket_prices").select("*").eq("id", id).single();

export const update = async (id, data) => supabase.from("ticket_prices").update(data).eq("id", id);

export const remove = async (id) => supabase.from("ticket_prices").delete().eq("id", id);
