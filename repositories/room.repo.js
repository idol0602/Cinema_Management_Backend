import { supabase } from "../config/supabase.js";

export const create = async (room) => {
    return await supabase.from("rooms").insert(room).single();
}

export const findAll = async () => {
    return await supabase.from("rooms").select("*").eq("is_active", true);
}

export const findById = async (id) => {
    return await supabase
        .from("rooms")
        .select("*")
        .eq("id", id)
        .eq("is_active", true);
}

export const update = async (id, data) => {
    return await supabase.from("rooms").update(data).eq("id", id);
}

export const remove = async (id) => {
    return await supabase.from("rooms").update({ is_active: false }).eq("id", id);
}