import * as roomService from "../services/room.service.js";
import { success } from "../utils/response.js";

export const create = async (req, res, next) => {
  try {
    const { data, error } = await roomService.create(req.body);
    if (error) throw error;
    return success(res, data, "Create room successfully");
  } catch (e) {
    next(e);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { data, error } = await roomService.findAll();
    if (error) throw error;
    return success(res, data, "Get rooms successfully");
  } catch (e) {
    next(e);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await roomService.findById(id);
    if (error) throw error;
    return success(res, data, "Get room successfully");
  } catch (e) {
    next(e);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await roomService.update(id, req.body);
    if (error) throw error;
    return success(res, data, "Update room successfully");
  } catch (e) {
    next(e);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await roomService.remove(id);
    if (error) throw error;
    return success(res, data, "Delete room successfully");
  } catch (e) {
    next(e);
  }
}