import { supabase } from "../config/supabase.js";

export const create = async (payload) => supabase.from("menu_item_in_tickets").insert(payload).single();

export const findAll = async () => supabase.from("menu_item_in_tickets").select("*");

export const findById = async (id) =>
  supabase.from("menu_item_in_tickets").select("*").eq("id", id).single();

export const update = async (id, data) => supabase.from("menu_item_in_tickets").update(data).eq("id", id);

export const remove = async (id) => supabase.from("menu_item_in_tickets").delete().eq("id", id);
