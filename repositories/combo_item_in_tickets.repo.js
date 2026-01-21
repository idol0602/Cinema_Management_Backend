import { supabase } from "../config/supabase.js";
import { comboItemInTicketPaginateConfig } from "../config/paginate/combo_item_in_ticket.config.js";
import { paginate } from "../utils/paginate.js";

export const create = async (payload) => {
  return await supabase.from("combo_item_in_tickets").insert(payload).single();
};

export const findAll = async () => {
  return await supabase.from("combo_item_in_tickets").select("*");
};

export const findById = async (id) => {
  return await supabase
    .from("combo_item_in_tickets")
    .select("*")
    .eq("id", id)
    .single();
};

export const update = async (id, data) => {
  return await supabase.from("combo_item_in_tickets").update(data).eq("id", id);
};

export const remove = async (id) => {
  return await supabase.from("combo_item_in_tickets").delete().eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "combo_item_in_tickets",
    query: query,
    config: comboItemInTicketPaginateConfig,
    baseFilters: {},
  });
};
