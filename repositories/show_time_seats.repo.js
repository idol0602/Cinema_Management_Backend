import { supabase } from "../config/supabase.js";
import { showTimeSeatPaginateConfig } from "../config/paginate/show_time_seat.config.js";
import { paginate } from "../utils/paginate.js";

export const create = async (payload) => {
  return await supabase.from("show_time_seats").insert(payload).single();
};

export const findAll = async () => {
  return await supabase.from("show_time_seats").select("*");
};

export const findById = async (id) => {
  return await supabase
    .from("show_time_seats")
    .select("*")
    .eq("id", id)
    .single();
};

export const update = async (id, data) => {
  return await supabase.from("show_time_seats").update(data).eq("id", id);
};

export const remove = async (id) => {
  return await supabase.from("show_time_seats").delete().eq("id", id);
};

export const getStatus = async (id) => {
  return supabase.from("show_time_seats").select("status_seat").eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "show_time_seats",
    query: query,
    config: showTimeSeatPaginateConfig,
    baseFilters: {},
  });
};

export const bulkCreate = async (payload) => {
  return await supabase.from("show_time_seats").insert(payload);
}