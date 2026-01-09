import * as service from "../services/auth.service.js";
import { success, fail } from "../utils/response.js";
export const register = async (req, res, next) => {
  try {
    const { data, error } = await service.register(req.body);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Register successfully", 201);
  } catch (e) {
    next(e);
  }
};

export const login = async (req, res, next) => {
  try {
    const { data, error } = await service.login(req.body);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Login successfully");
  } catch (e) {
    next(e);
  }
};
