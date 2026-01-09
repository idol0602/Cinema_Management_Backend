import * as service from "../services/movie.service.js";
import { success, fail } from "../utils/response.js";
import fs from "fs";

export const create = async (req, res, next) => {
  try {
    const { data, error } = await service.create(req.body);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Create movie successfully", 201);
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
    return success(res, data, "Get movies successfully");
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
    return success(res, data, "Get movie successfully");
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
    return success(res, data, "Update successfully");
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
    return success(res, data, "Delete movie successfully");
  } catch (e) {
    next(e);
  }
};

export const findAndPaginate = async (req, res, next) => {
  try {
    const result = await service.findAndPaginate(req.query);
    if (result.error) {
      return fail(res, result.error);
    }
    return res.json({
      success: true,
      data: result.data,
      meta: result.meta,
      links: result.links,
      message: "Get movies successfully",
    });
  } catch (e) {
    next(e);
  }
};

export const importFromExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
        data: {
          imported: 0,
          skipped: 0,
        },
      });
    }
    const result = await service.importFromExcel(req.file.path);

    fs.unlinkSync(req.file.path);

    if (result.error) {
      throw result.error;
    }

    return res.json({
      success: true,
      message: `Imported ${result.imported} movies successfully. Skipped ${result.skipped} invalid rows.`,
      data: {
        imported: result.imported,
        skipped: result.skipped,
      },
    });
  } catch (e) {
    if (req.file && s.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(e);
  }
};
