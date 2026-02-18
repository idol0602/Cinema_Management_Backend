import * as service from "../services/movie.service.js";
import { success, fail } from "../utils/response.js";
import { deleteImage, uploadBase64 } from "../services/cloudinary.service.js";
import fs from "fs";

/**
 * Check if a string is a base64 image
 */
const isBase64Image = (str) => {
  if (!str || typeof str !== "string") return false;
  return str.startsWith("data:image/") || (str.length > 500 && /^[A-Za-z0-9+/=]+$/.test(str.substring(0, 100)));
};

/**
 * Check if a string is already a Cloudinary/HTTP URL
 */
const isUrl = (str) => {
  if (!str || typeof str !== "string") return false;
  return str.startsWith("http://") || str.startsWith("https://");
};

export const create = async (req, res, next) => {
  try {
    // Handle image upload from multer (file upload)
    if (req.file) {
      req.body.image = req.file.path;
    }
    // Handle base64 image from frontend - upload to Cloudinary
    else if (req.body.image && isBase64Image(req.body.image)) {
      const { url } = await uploadBase64(req.body.image, "cinema_movies");
      req.body.image = url;
    }
    
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

export const getByName = async (req, res, next) => {
  try {
    const { name } = req.query;
    if (!name || typeof name !== "string") {
      return res.status(400).json({
        message: "Slug is required",
      });
    }
    const { data, error } = await service.findByName(name);
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
    
    // Handle image upload from multer (file upload)
    if (req.file) {
      const { data: existing } = await service.findById(id);
      if (existing?.image && isUrl(existing.image)) {
        await deleteImage(existing.image);
      }
      req.body.image = req.file.path;
    }
    // Handle base64 image from frontend - upload to Cloudinary
    else if (req.body.image && isBase64Image(req.body.image)) {
      const { data: existing } = await service.findById(id);
      if (existing?.image && isUrl(existing.image)) {
        await deleteImage(existing.image);
      }
      const { url } = await uploadBase64(req.body.image, "cinema_movies");
      req.body.image = url;
    }
    
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
    const { data: existing } = await service.findById(id);
    
    const { data, error } = await service.remove(id);
    if (error) {
      return fail(res, error);
    }
    
    // Delete image from Cloudinary
    if (existing?.image && isUrl(existing.image)) {
      await deleteImage(existing.image);
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
        data: { imported: 0, skipped: 0 },
      });
    }
    const result = await service.importFromExcel(req.file.path);
    
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (result.error) {
      throw result.error;
    }

    return res.json({
      success: true,
      message: `Imported ${result.imported} movies successfully. Skipped ${result.skipped} invalid rows.`,
      data: { imported: result.imported, skipped: result.skipped },
    });
  } catch (e) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(e);
  }
};

export const findNowShowing = async (req, res, next) => {
  try {
    const result = await service.findNowShowing(req.query);
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

export const findComingSoon = async (req, res, next) => {
  try {
    const result = await service.findComingSoon(req.query);
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