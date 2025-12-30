import { supabase } from "../config/supabase.js";

export const create = async (payload) => supabase.from("show_time_seats").insert(payload).single();

export const findAll = async () => supabase.from("show_time_seats").select("*");

export const findById = async (id) => supabase.from("show_time_seats").select("*").eq("id", id).single();

export const update = async (id, data) => supabase.from("show_time_seats").update(data).eq("id", id);

export const remove = async (id) => supabase.from("show_time_seats").delete().eq("id", id);

export const getStatus = async(id) => {
    return supabase.from("show_time_seats").select("status_seat").eq("id", id)
}