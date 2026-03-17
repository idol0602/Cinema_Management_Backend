import * as repo from "../repositories/movie.repo.js";
import { v4 as uuidv4 } from "uuid";
import xlsx from "xlsx";
import { getCache, setCacheWithTTL } from "../redis/cache.js";
import { CACHE_PREFIX, TTL, buildCacheKey } from "../redis/cacheKeys.js";
import { Producer } from "../rabbitmq/producer.js";

const invalidateCache = () => {
  Producer.deleteCache(`${CACHE_PREFIX.MOVIES}:*`);
};

export const create = async (payload) => {
  const { movie, movieTypes } = payload;

  const movieId = uuidv4();

  const rpcPayload = {
    p_id: movieId,
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
    p_movie_type_ids: movieTypes,
  };

  const result = await repo.createWithTypes(rpcPayload);

  if (!result.error) {
    invalidateCache();
  }

  return result;
};

export const findAll = () => repo.findAll();
export const findById = (id) => repo.findById(id);
export const findByName = (name) => repo.findByName(name);

export const update = async (id, payload) => {
  const { movie, movieTypes } = payload;

  const rpcPayload = {
    p_id: id,
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
    p_movie_type_ids: movieTypes,
  };

  const result = await repo.updateWithTypes(rpcPayload);

  if (!result.error) {
    invalidateCache();
  }

  return result;
};

export const remove = async (id) => {
  const result = await repo.remove(id);
  if (!result.error) invalidateCache();
  return result;
};

export const findAndPaginate = async (query) => {
  const cacheKey = buildCacheKey(CACHE_PREFIX.MOVIES, query);

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const result = await repo.findAndPaginate(query);

  if (!result.error) {
    await setCacheWithTTL(cacheKey, result, TTL.WARM);
  }

  return result;
};

export const importFromExcel = async (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data = xlsx.utils.sheet_to_json(worksheet);

    const movies = data.map((row) => ({
      id: uuidv4(),
      title: row.title || row.Title,
      director: row.director || row.Director,
      country: row.country || null,
      description: row.description || null,
      release_date: row.release_date || new Date().toISOString(),
      duration: parseInt(row.duration || row.Duration) || null,
      rating: parseFloat(row.rating || row.Rating) || 0,
      image: row.image || null,
      thumbnail: row.thumbnail || null,
      trailer: row.trailer || null,
      is_active: row.is_active ?? true,
      movie_type_ids: String(row.movie_type_id || row.MovieTypeId)
        .split(",")
        .map((x) => x.trim()),
    }));

    // Lọc bỏ các dòng không hợp lệ (thiếu title, director, movie_type_id)
    const validMovies = movies.filter(
      (movie) =>
        movie.title && movie.director && movie.movie_type_ids.length > 0,
    );

    if (validMovies.length === 0) {
      return {
        error: new Error("No valid movies found in the Excel file"),
      };
    }

    // Insert bulk vào database
    const result = await repo.bulkCreate(validMovies);
    if (!result.error) invalidateCache();

    return {
      data: result.data,
      error: result.error,
      imported: validMovies.length,
      skipped: movies.length - validMovies.length,
    };
  } catch (error) {
    return {
      error: error,
      imported: 0,
      skipped: 0,
    };
  }
};

export const findNowShowing = async (query) => {
  const cacheKey = buildCacheKey(`${CACHE_PREFIX.MOVIES}:now_showing`, query);

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const result = await repo.findAndPaginateWithStatus({
    query,
    view: "movie_now_showing",
  });

  if (!result.error) {
    await setCacheWithTTL(cacheKey, result, TTL.WARM);
  }

  return result;
};

export const findComingSoon = async (query) => {
  const cacheKey = buildCacheKey(`${CACHE_PREFIX.MOVIES}:coming_soon`, query);

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const result = await repo.findAndPaginateWithStatus({
    query,
    view: "movie_coming_soon",
  });

  if (!result.error) {
    await setCacheWithTTL(cacheKey, result, TTL.WARM);
  }

  return result;
};
