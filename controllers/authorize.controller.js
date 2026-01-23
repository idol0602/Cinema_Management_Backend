import * as service from "../services/authorize.service.js";
import { success, fail } from "../utils/response.js";

export const create = async (req, res, next) => {
  try {
    const is_exits = await service.findByRoleAndAction(
      req.body.role_id,
      req.body.action_id,
    );
    if (Array.isArray(is_exits.data) && is_exits.data.length > 0) {
      return fail(res, {
        message: "This action has been authorized",
      });
    }
    const { data, error } = await service.create(req.body);
    if (error) throw error;
    return success(res, data, "Create authorization successfully");
  } catch (e) {
    next(e);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { data, error } = await service.findAll();
    if (error) throw error;
    return success(res, data, "Get authorizations successfully");
  } catch (e) {
    next(e);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await service.findById(id);
    if (error) throw error;
    return success(res, data, "Get authorization successfully");
  } catch (e) {
    next(e);
  }
};

export const getByRoleId = async (req, res, next) => {
  try {
    const { roleId } = req.params;
    const { data, error } = await service.findByRoleId(roleId);
    if (error) throw error;
    return success(res, data, "Get authorizations by role successfully");
  } catch (e) {
    next(e);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await service.update(id, req.body);
    if (error) throw error;
    return success(res, data, "Update authorization successfully");
  } catch (e) {
    next(e);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await service.remove(id);
    if (error) throw error;
    return success(res, data, "Delete authorization successfully");
  } catch (e) {
    next(e);
  }
};

export const findAndPaginate = async (req, res, next) => {
  try {
    const result = await service.findAndPaginate(req.query);
    if (result.error) throw result.error;
    return success(res, result.data, "Get authorizations successfully");
  } catch (e) {
    next(e);
  }
};

export const bulkCreate = async (req, res, next) => {
  try {
    const authorizesData = req.body;
    if (!Array.isArray(authorizesData) || authorizesData.length === 0) {
      return fail(res, {
        message: "Authorize data must be a non-empty array",
      });
    }
    const authorizeExist = await service.findByRoleId(
      authorizesData[0].role_id,
    );

    const existedSet = new Set(
      authorizeExist.data.map((item) => `${item.role_id}_${item.action_id}`),
    );

    // tìm hiệu của authorizesData - authorizeExist
    const dataToCreate = authorizesData.filter(
      (item) => !existedSet.has(`${item.role_id}_${item.action_id}`),
    );

    if (dataToCreate.length === 0) {
      return success(res, [], "No new authorizations to create");
    }

    const { data, error } = await service.bulkCreate(dataToCreate);
    if (error) throw error;
    return success(res, data, "Bulk create authorizations successfully");
  } catch (e) {
    next(e);
  }
};

export const bulkRemove = async (req, res, next) => {
  try {
    console.log(req.body);
    const result = await service.bulkRemove;
    if (result.error) throw result.error;
    return success(res, result.data, "Get authorizations successfully");
  } catch (e) {
    next(e);
  }
};
