import { supabase } from "../config/supabase.js";
import { comboEventPaginateConfig } from "../config/paginate/combo_event.config.js";
import { paginate } from "../utils/paginate.js";

export const create = async (payload) => {
  return await supabase.from("combo_events").insert(payload).single();
};

export const findAll = async () => {
  return await supabase.from("combo_events").select("*");
};

export const findById = async (id) => {
  return await supabase.from("combo_events").select("*").eq("id", id).single();
};

export const update = async (id, data) => {
  return await supabase.from("combo_events").update(data).eq("id", id);
};

export const remove = async (id) => {
  return await supabase.from("combo_events").delete().eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "combo_events",
    query: query,
    config: comboEventPaginateConfig,
    baseFilters: {},
  });
};
