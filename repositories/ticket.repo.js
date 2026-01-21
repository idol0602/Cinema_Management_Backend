import { supabase } from "../config/supabase.js";
import { ticketPaginateConfig } from "../config/paginate/ticket.config.js";
import { paginate } from "../utils/paginate.js";

export const create = async (payload) => {
  return await supabase.from("tickets").insert(payload).single();
};

export const findAll = async () => {
  return await supabase
    .from("tickets")
    .select("*")
    .order("id", { ascending: false });
};

export const findById = async (id) => {
  return await supabase.from("tickets").select("*").eq("id", id).single();
};

export const update = async (id, data) => {
  return await supabase.from("tickets").update(data).eq("id", id);
};

export const remove = async (id) => {
  return await supabase.from("tickets").delete().eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "tickets",
    query: query,
    config: ticketPaginateConfig,
    baseFilters: {},
  });
};
