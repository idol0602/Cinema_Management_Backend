import { supabase } from "../config/supabase.js";
import { userPaginateConfig } from "../config/paginate/user.config.js";
import { paginate } from "../utils/paginate.js";

export const findByEmail = async (email) => {
  return await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .eq("is_active", true)
    .single();
};

export const create = async (userToCreate) => {
  return await supabase.from("users").insert(userToCreate).select().single();
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

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "users",
    query: query,
    config: userPaginateConfig,
    baseFilters: {},
  });
};

export const checkLastAdmin = async (id) => {
  try {
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();

    if (userError) {
      throw userError;
    }

    if (!currentUser || currentUser.role !== "ADMIN") {
      return false;
    }

    const { count, error: countError } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "ADMIN")
      .eq("is_active", true)
      .neq("id", id);

    if (countError) {
      throw countError;
    }

    const isLast = count === 0;

    return isLast;
  } catch (error) {
    return false;
  }
};
