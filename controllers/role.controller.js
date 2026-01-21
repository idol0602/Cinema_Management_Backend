import * as service from "../services/role.service.js";
import { success, fail } from "../utils/response.js";

export const create = async (req, res, next) => {
  try {
    const { data, error } = await service.create(req.body);
    if (error) throw error;
    return success(res, data, "Create role successfully");
  } catch (e) {
    next(e);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { data, error } = await service.findAll();
    if (error) throw error;
    return success(res, data, "Get roles successfully");
  } catch (e) {
    next(e);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await service.findById(id);
    if (error) throw error;
    return success(res, data, "Get role successfully");
  } catch (e) {
    next(e);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await service.update(id, req.body);
    if (error) throw error;
    return success(res, data, "Update role successfully");
  } catch (e) {
    next(e);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await service.remove(id);
    if (error) throw error;
    return success(res, data, "Delete role successfully");
  } catch (e) {
    next(e);
  }
};

export const findAndPaginate = async (req, res, next) => {
  try {
    const result = await service.findAndPaginate(req.query);
    if (result.error) throw result.error;
    return success(res, result.data, "Get roles successfully");
  } catch (e) {
    next(e);
  }
};
