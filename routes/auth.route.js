import { Router } from "express";
import * as controller from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
} from "../validators/auth.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { rateLimitByIP } from "../middlewares/rateLimit.middleware.js";
import { RATE_LIMIT_ACTION } from "../utils/rateLimitAction.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

router.post(
  "/login",
  validate(loginSchema),
  rateLimitByIP(RATE_LIMIT_ACTION.LOGIN),
  controller.login,
);
router.post("/logout", auth, controller.logout);
router.post(
  "/forgot-password",
  rateLimitByIP(RATE_LIMIT_ACTION.FORGOT_PASSWORD),
  controller.forgotPassword,
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  rateLimitByIP(RATE_LIMIT_ACTION.RESET_PASSWORD),
  controller.resetPassword,
);
router.post(
  "/send-otp",
  validate(registerSchema),
  rateLimitByIP(RATE_LIMIT_ACTION.REGISTER),
  controller.sendOtp,
);
router.post(
  "/verify-otp",
  rateLimitByIP(RATE_LIMIT_ACTION.REGISTER),
  controller.verifyOtp,
);
router.post(
  "/resend-otp",
  rateLimitByIP(RATE_LIMIT_ACTION.REGISTER),
  controller.resendOtp,
);
router.put(
  "/update-profile/:id",
  auth,
  authorize(),
  controller.updateProfile,
);

export default router;
