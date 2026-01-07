import * as repo from "../repositories/order.repo";
import { v4 as uuidv4 } from "uuid";

export const create = (order) => {
  const movieWithId = {
    id: uuidv4(),
    ...order,
  };
  return repo.create(movieWithId);
};

export const findAll = () => repo.findAll();
export const findById = (id) => repo.findById(id);
export const update = (id, data) => repo.update(id, data);
export const findAndPaginate = (query) => repo.findAndPaginate(query);
