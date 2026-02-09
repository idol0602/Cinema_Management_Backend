import * as authService from "../services/auth.service.js";
import * as tokenService from "../services/token.service.js";
import { success, fail } from "../utils/response.js";
export const register = async (req, res, next) => {
  try {
    const { data, error } = await authService.register(req.body);
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
    const { data, error } = await authService.login(req.body);
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
    const { success: isSuccess, message } = await authService.forgotPassword(email);
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
    const { data, error } = await authService.resetPassword(req.body);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Reset password successfully");
  } catch (e) {
    next(e);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const { data, error } = await authService.updateProfile({ userId: id, payload });

    if (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "No token provided",
      });
    }

    // Revoke current token
    await tokenService.revokeToken(token);
    
    // Clear active session
    await tokenService.clearActiveSession(userId);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
