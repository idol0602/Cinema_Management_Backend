import { supabase } from "../config/supabase.js";
import { moviePaginateConfig, moviePaginateConfigWithStatus } from "../config/paginate/movie.config.js";
import { paginate } from "../utils/paginate.js";

export const create = async (movie) => {
  return await supabase.from("movies").insert(movie).single();
};

export const findAll = async () => {
  return await supabase
    .from("movies")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
};

export const findById = async (id) => {
  return await supabase
    .from("movies")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();
};

export const findByName = async (name) => {
  return await supabase
    .from("movies")
    .select("*")
    .ilike("title", `%${name}%`)
    .eq("is_active", true);
};

export const update = async (id, data) => {
  return await supabase.from("movies").update(data).eq("id", id);
};

export const remove = async (id) => {
  return await supabase
    .from("movies")
    .update({
      is_active: false,
    })
    .eq("id", id);
};

export const findAndPaginate = async (query) => {
  return await paginate({
    supabase,
    table: "movies",
    query: query,
    config: moviePaginateConfig,
    baseFilters: {},
    joinTables: {
      movie_movie_types: "movie_id",
    },
  });
};

export const findAndPaginateWithStatus = async ({query,view}) => {
  return await paginate({
    supabase,
    table: view, // ⭐ dùng VIEW
    query,
    config: moviePaginateConfigWithStatus,
    baseFilters: {},
    joinTables: {
      movie_movie_types: "movie_id",
    },
  });
};

// export const bulkCreate = async (movies) => {
//   return await supabase.from("movies").insert(movies);
// };

export const bulkCreate = async (movies) => {
  const batchSize = 20;
  const results = [];

  for (let i = 0; i < movies.length; i += batchSize) {
    const batch = movies.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map((movie) =>
        supabase.rpc("create_movie_with_types", {
          p_id: movie.id,
          p_title: movie.title,
          p_director: movie.director,
          p_country: movie.country ?? null,
          p_description: movie.description ?? null,
          p_release_date: movie.release_date ?? null,
          p_duration: movie.duration ?? null,
          p_rating: movie.rating ?? 0,
          p_trailer: movie.trailer ?? null,
          p_image: movie.image ?? null,
          p_thumbnail: movie.thumbnail ?? null,
          p_is_active: movie.is_active ?? true,
          p_movie_type_ids: movie.movie_type_ids,
        })
      )
    );

    results.push(...batchResults);
  }

  const error = results.find((r) => r.error);

  if (error) {
    return { data: null, error: error.error };
  }

  return { data: results, error: null };
};



export const createWithTypes = async (payload) => {
  return await supabase.rpc("create_movie_with_types", payload);
};

export const updateWithTypes = async (payload) => {
  return await supabase.rpc("update_movie_with_types", payload);
};