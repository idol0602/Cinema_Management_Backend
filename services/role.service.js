import * as repo from "../repositories/role.repo.js";
import { v4 as uuidv4 } from "uuid";

export const findByName = (name) => repo.findByName(name);

export const create = async (role) => {
  const roleWithId = {
    id: uuidv4(),
    created_at: new Date().toISOString(),
    is_active: true,
    ...role,
  };
  return repo.create(roleWithId);
};

export const findAll = () => repo.findAll();

export const findById = (id) => repo.findById(id);

export const update = (id, data) => repo.update(id, data);

export const remove = (id) => repo.remove(id);

export const findAndPaginate = (query) => repo.findAndPaginate(query);
