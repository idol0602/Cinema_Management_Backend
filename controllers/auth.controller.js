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

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { success: isSuccess, message } = await service.forgotPassword(email);
    if (!isSuccess) {
      return fail(res, { message: message });
    }
    return success(res, null, message);
  } catch (e) {
    next(e);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { data, error } = await service.resetPassword(req.body);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Reset password successfully");
  } catch (e) {
    next(e);
  }
};
