import { supabase } from "../config/supabase";

export const findByEmail = async (email) => {
  return await supabase.from("users").select("*").eq("email", email).single();
};

export const create = async (userToCreate) => {
  return await supabase.from("users").insert(userToCreate).single();
};

export const findAll = async () => {
  return await supabase.from("users").select("*").eq("is_active", true);
};

export const findById = async (id) => {
  return await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .eq("is_active", true);
};

export const update = async (id, data) => {
  return supabase.from("users").update(data).eq("id", id);
};

export const remove = async (id) => {
  return await supabase.from("users").update({ is_active: false }).eq("id", id);
};
