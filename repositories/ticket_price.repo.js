import { supabase } from "../config/supabase.js";

export const create = async (payload) => {
  return await supabase.from("ticket_prices").insert(payload).single();
};

export const findAll = async () => {
  return await supabase.from("ticket_prices").select("*");
};

export const findById = async (id) => {
  return await supabase.from("ticket_prices").select("*").eq("id", id).single();
};

export const update = async (id, data) => {
  return await supabase.from("ticket_prices").update(data).eq("id", id);
};

export const remove = async (id) => {
  return await supabase
    .from("ticket_prices")
    .update({ is_active: false })
    .eq("id", id);
};
