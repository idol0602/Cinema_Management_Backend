import * as repo from "../repositories/action.repo.js";
import { v4 as uuidv4 } from "uuid";

export const findByPath = (path, method) => repo.findByPath(path, method);

export const create = async (action) => {
  const actionWithId = {
    id: uuidv4(),
    created_at: new Date().toISOString(),
    is_active: true,
    ...action,
  };
  return repo.create(actionWithId);
};

export const findAll = () => repo.findAll();

export const findById = (id) => repo.findById(id);

export const update = (id, data) => repo.update(id, data);

export const remove = (id) => repo.remove(id);

export const findAndPaginate = (query) => repo.findAndPaginate(query);
