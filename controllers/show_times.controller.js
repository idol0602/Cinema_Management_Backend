import * as service from "../services/show_times.service.js";
import { success, fail } from "../utils/response.js";

export const create = async (req, res, next) => {
  try {
    const { data, error } = await service.create(req.body);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Create show time successfully", 201);
  } catch (e) {
    next(e);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { data, error } = await service.findAll();
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Get show times successfully");
  } catch (e) {
    next(e);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await service.findById(id);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Get show time successfully");
  } catch (e) {
    next(e);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await service.update(id, req.body);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Update show time successfully");
  } catch (e) {
    next(e);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await service.remove(id);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Remove show time successfully");
  } catch (e) {
    next(e);
  }
};

export const findAndPaginate = async (req, res, next) => {
  try {
    const result = await service.findAndPaginate(req.query);
    if (result.error) throw result.error;
    return res.json({
      success: true,
      data: result.data,
      meta: result.meta,
      links: result.links,
      message: "Get show times successfully",
    });
  } catch (e) {
    next(e);
  }
};
