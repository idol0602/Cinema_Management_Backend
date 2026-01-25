import { supabase } from "../config/supabase.js";
import { comboPaginateConfig } from "../config/paginate/combo.config.js";
import { paginate } from "../utils/paginate.js";

export const create = async ({ p_combo, p_combo_items, p_combo_movie, p_combo_event }) => {
  return await supabase.rpc("insert_combo_with_details", {
    p_combo,
    p_combo_items,
    p_combo_movie,
    p_combo_event,
  });
};

export const findAll = async () => {
  return await supabase
    .from("combos")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
};

export const findById = async (id) => {
  return await supabase
    .from("combos")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();
};

export const update = async (id, data) => {
  return await supabase.from("combos").update(data).eq("id", id);
};

export const remove = async (id) => {
  return await supabase
    .from("combos")
    .update({ is_active: false })
    .eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "combos",
    query: query,
    config: comboPaginateConfig,
    baseFilters: {},
    joinTables: {
      combo_movies: "combo_id",
      combo_events: "combo_id",
      combo_items: "combo_id",
    },
  });
};
