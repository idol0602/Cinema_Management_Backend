import * as service from "../services/menu_items.service.js";
import { success, fail } from "../utils/response.js";
import { deleteImage, uploadBase64 } from "../services/cloudinary.service.js";

const isBase64Image = (str) => {
  if (!str || typeof str !== "string") return false;
  return str.startsWith("data:image/") || (str.length > 500 && /^[A-Za-z0-9+/=]+$/.test(str.substring(0, 100)));
};

const isUrl = (str) => {
  if (!str || typeof str !== "string") return false;
  return str.startsWith("http://") || str.startsWith("https://");
};

export const create = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.image = req.file.path;
    } else if (req.body.image && isBase64Image(req.body.image)) {
      const { url } = await uploadBase64(req.body.image, "cinema_menu_items");
      req.body.image = url;
    }
    
    const { data, error } = await service.create(req.body);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Create menu item successfully", 201);
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
    return success(res, data, "Get menu items successfully");
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
    return success(res, data, "Get menu item successfully");
  } catch (e) {
    next(e);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (req.file) {
      const { data: existing } = await service.findById(id);
      if (existing?.image && isUrl(existing.image)) {
        await deleteImage(existing.image);
      }
      req.body.image = req.file.path;
    } else if (req.body.image && isBase64Image(req.body.image)) {
      const { data: existing } = await service.findById(id);
      if (existing?.image && isUrl(existing.image)) {
        await deleteImage(existing.image);
      }
      const { url } = await uploadBase64(req.body.image, "cinema_menu_items");
      req.body.image = url;
    }
    
    const { data, error } = await service.update(id, req.body);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Update menu item successfully");
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
    
    if (existing?.image && isUrl(existing.image)) {
      await deleteImage(existing.image);
    }
    
    return success(res, data, "Remove menu item successfully");
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
      message: "Get menu items successfully",
    });
  } catch (e) {
    next(e);
  }
};
