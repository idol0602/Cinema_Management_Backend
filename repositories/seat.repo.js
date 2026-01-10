import { supabase } from "../config/supabase.js";
import { paginate } from "../utils/paginate.js";
import { seatPagiantionConfig } from "../config/paginate/seat.config.js";

export const create = async (payload) =>
  supabase.from("seats").insert(payload).single();

export const findAll = async () =>
  supabase.from("seats").select("*").eq("is_active", true);

export const findById = async (id) =>
  supabase
    .from("seats")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

export const update = async (id, data) =>
  supabase.from("seats").update(data).eq("id", id);

export const remove = async (id) =>
  supabase.from("seats").update({ is_active: false }).eq("id", id);

export const getSeatByRoomId = async (roomId) =>
  supabase.from("seats").select("*").eq("room_id", roomId);

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "seats",
    query: query,
    config: seatPagiantionConfig,
    baseFilters: {},
  });
};

export const bulkCreate = async (seats) => {
  return await supabase.from("seats").insert(seats);
};
