import {v4 as uuidv4} from 'uuid';
import * as repo from "../repositories/room.repo.js";

export const create = (room) => {
  const roomWithId = {
    id: uuidv4(), // tự sinh id
    ...room,
  };

  return repo.create(roomWithId);
}

export const findAll = () => repo.findAll();

export const findById = (id) => repo.findById(id);

export const update = (id, data) => repo.update(id, data);

export const remove = (id) => repo.remove(id);