import * as service from "../services/user.service.js";
import { success, fail } from "../utils/response.js";

export const create = async (req, res, next) => {
  try {
    const { data, error } = await service.create(req.body);
    if (error) throw error;
    return success(res, data, "Create user successfully");
  } catch (e) {
    next(e);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { data, error } = await service.findAll();
    if (error) throw error;
    return success(res, data, "Get users successfully");
  } catch (e) {
    next(e);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await service.findById(id);
    if (error) throw error;
    return success(res, data, "Get user successfully");
  } catch (e) {
    next(e);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isLastAdmin = await service.checkLastAdmin(id);
    if (isLastAdmin && req.body.role != "ADMIN") {
      return fail(res, {
        error: "last admin",
        message: "can't update to another role",
      });
    }
    const { data, error } = await service.update(id, req.body);
    if (error) throw error;
    return success(res, data, "Update user successfully");
  } catch (e) {
    next(e);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isLastAdmin = await service.checkLastAdmin(id);
    if (isLastAdmin) {
      return fail(res, {
        error: "last admin",
        message: "can't delete",
      });
    }
    const { data, error } = await service.remove(id);
    if (error) throw error;
    return success(res, data, "Remove user successfully");
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
      message: "Get users successfully",
    });
  } catch (e) {
    next(e);
  }
};

export const heartbeat = async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    const result = await service.heartbeat({ uid: userId });
    if (result.error) {
      throw result.error;
    }
    res.sendStatus(200);
  } catch (error) {
    console.error("Heartbeat exception:", error);
    res.status(500).json({ error: error.message || "Heartbeat failed" });
  }
};

export const online = async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    const result = await service.online(userId);
    if (result.error) throw result.error;
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
};

export const offline = async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    const result = await service.offline(userId);
    if (result.error) {
      console.error("Offline error:", result.error);
      throw result.error;
    }
    res.sendStatus(200);
  } catch (error) {
    console.error("Offline exception:", error);
    res.status(500).json({ error: error.message || "Offline failed" });
  }
};
