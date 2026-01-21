import * as repo from "../repositories/authorize.repo.js";
import { v4 as uuidv4 } from "uuid";

export const findByRoleAndAction = (roleId, actionId) =>
  repo.findByRoleAndAction(roleId, actionId);

export const create = async (authorize) => {
  const authorizeWithId = {
    id: uuidv4(),
    ...authorize,
  };
  return repo.create(authorizeWithId);
};

export const findAll = () => repo.findAll();

export const findById = (id) => repo.findById(id);

export const findByRoleId = (roleId) => repo.findByRoleId(roleId);

export const update = (id, data) => repo.update(id, data);

export const remove = (id) => repo.remove(id);

export const findAndPaginate = (query) => repo.findAndPaginate(query);
