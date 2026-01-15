import { supabase } from "../config/supabase.js";
import { showTimePaginateConfig } from "../config/paginate/show_time.config.js";
import { paginate } from "../utils/paginate.js";

export const create = async (payload) => {
  return await supabase.from("show_times").insert(payload).single();
};

export const findAll = async () => {
  return await supabase.from("show_times").select("*").eq("is_active", true);
};

export const findById = async (id) => {
  return await supabase
    .from("show_times")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();
};

export const update = async (id, data) => {
  return await supabase.from("show_times").update(data).eq("id", id);
};

export const remove = async (id) => {
  return await supabase
    .from("show_times")
    .update({ is_active: false })
    .eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "show_times",
    query: query,
    config: showTimePaginateConfig,
    baseFilters: {},
    joinTables: {
      movies: "movie_id",
      rooms: "room_id",
    },
  });
};

export const findByRoomId = async (room_id) => {
  return await supabase.from("show_times").select("*").eq("room_id", room_id);
};

export const findByRoomIdsAndDates = async (roomIds, startDate, endDate) => {
  return await supabase
    .from("show_times")
    .select("*")
    .in("room_id", roomIds)
    .eq("is_active", true)
    .gte("start_time::date", startDate)
    .lte("end_time::date", endDate);
};
