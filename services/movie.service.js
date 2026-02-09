import * as repo from "../repositories/movie.repo.js";
import { v4 as uuidv4 } from "uuid";
import xlsx from "xlsx";
import { getCache, setCacheWithTTL } from "../redis/cache.js";
import { CACHE_PREFIX, TTL, buildCacheKey } from "../redis/cacheKeys.js";
import { Producer } from "../rabbitmq/producer.js";

const invalidateCache = () => {
  Producer.deleteCache(`${CACHE_PREFIX.MOVIES}:*`);
};

export const create = async (movie) => {
  const movieWithId = {
    id: uuidv4(),
    ...movie,
  };
  const result = await repo.create(movieWithId);
  if (!result.error) invalidateCache();
  return result;
};

export const findAll = () => repo.findAll();
export const findById = (id) => repo.findById(id);
export const findByName = (name) => repo.findByName(name);

export const update = async (id, data) => {
  const result = await repo.update(id, data);
  if (!result.error) invalidateCache();
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
      description: row.description || row.Description || null,
      release_date:
        row.release_date || row.ReleaseDate || new Date().toISOString(),
      duration: parseInt(row.duration || row.Duration) || null,
      rating: parseFloat(row.rating || row.Rating) || 0,
      image: row.image || row.Image || null,
      thumbnail: row.thumbnail || row.Thumbnail || null,
      trailer: row.trailer || row.Trailer || null,
      movie_type_id: row.movie_type_id || row.MovieTypeId,
      is_active: row.is_active !== undefined ? row.is_active : true,
    }));

    // Lọc bỏ các dòng không hợp lệ (thiếu title, director, movie_type_id)
    const validMovies = movies.filter(
      (movie) => movie.title && movie.director && movie.movie_type_id
    );

    if (validMovies.length === 0) {
      return {
        error: new Error("No valid movies found in the Excel file"),
      };
    }

    // Insert bulk vào database
    const result = await repo.bulkCreate(validMovies);
    if(!result.error) invalidateCache();

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
