import { v4 as uuidv4 } from "uuid";
import * as repo from "../repositories/discount.repo.js";
import { getCache, setCacheWithTTL } from "../redis/cache.js";
import { CACHE_PREFIX, TTL, buildCacheKey } from "../redis/cacheKeys.js";
import { Producer } from "../rabbitmq/producer.js";

const invalidateCache = () => {
  Producer.deleteCache(`${CACHE_PREFIX.DISCOUNTS}:*`);
};

export const create = async (payload) => {
  const result = await repo.create({ id: uuidv4(), ...payload });
  if (!result.error) invalidateCache();
  return result;
};

export const findAll = () => repo.findAll();
export const findById = (id) => repo.findById(id);

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
  const cacheKey = buildCacheKey(CACHE_PREFIX.DISCOUNTS, query);
  
  const cached = await getCache(cacheKey);
  if (cached) return cached;
  
  const result = await repo.findAndPaginate(query);
  
  if (!result.error) {
    await setCacheWithTTL(cacheKey, result, TTL.WARM);
  }
  
  return result;
};

