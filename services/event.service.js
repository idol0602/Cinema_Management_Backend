import { v4 as uuidv4 } from "uuid";
import * as repo from "../repositories/event.repo.js";

export const create = (payload) => repo.create({ id: uuidv4(), ...payload });
export const findAll = () => repo.findAll();
export const findById = (id) => repo.findById(id);
export const update = (id, data) => repo.update(id, data);
export const remove = (id) => repo.remove(id);
export const findAndPaginate = (query) => repo.findAndPaginate(query);
