import * as repo from "../repositories/user.repo.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export const findByEmail = (email) => repo.findByEmail(email);

export const create = async (user) => {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const userWithId = {
    id: uuidv4(),
    ...user,
    password: hashedPassword,
  };
  return repo.create(userWithId);
};

export const findAll = () => repo.findAll();

export const findById = (id) => repo.findById(id);

export const update = (id, data) => repo.update(id, data);

export const remove = (id) => repo.remove(id);

export const findAndPaginate = (query) => repo.findAndPaginate(query);

export const checkLastAdmin = (id) => repo.checkLastAdmin(id);
