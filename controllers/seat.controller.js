import * as service from "../services/seat.service.js";
import { success, fail } from "../utils/response.js";

export const create = async (req, res, next) => {
  try {
    const { data, error } = await service.create(req.body);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Create seat successfully", 201);
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
    return success(res, data, "Get seats successfully");
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
    return success(res, data, "Get seat successfully");
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
    return success(res, data, "Update seat successfully");
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
    return success(res, data, "Remove seat successfully");
  } catch (e) {
    next(e);
  }
};

export const getSeatByRoomId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await service.getSeatByRoomId(id);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "get seat successfully");
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
      message: "Get seats successfully",
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
      message: `Imported ${result.imported} seats successfully. Skipped ${result.skipped} invalid rows.`,
      data: {
        imported: result.imported,
        skipped: result.skipped,
      },
    });
  } catch (e) {
    next(e);
  }
};
