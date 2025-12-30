import * as repo from "../repositories/movie.repo.js";
import { v4 as uuidv4 } from "uuid";

export const create = (movie) => {
  const movieWithId = {
    id: uuidv4(), // tự sinh id
    ...movie,
  };

  return repo.create(movieWithId);
};
export const findAll = () => repo.findAll();
export const findById = (id) => repo.findById(id);
export const update = (id, data) => repo.update(id, data);
export const remove = (id) => repo.remove(id);
