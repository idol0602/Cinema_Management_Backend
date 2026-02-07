import { Router } from "express";
import * as controller from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
} from "../validators/auth.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { rateLimitByUser } from "../middlewares/rateLimit.middleware.js";
import { RATE_LIMIT_ACTION } from "../utils/rateLimitAction.js";

const router = Router();

router.post("/register", validate(registerSchema), rateLimitByUser(RATE_LIMIT_ACTION.REGISTER), controller.register);
router.post("/login", validate(loginSchema), rateLimitByUser(RATE_LIMIT_ACTION.LOGIN), controller.login);
router.post("/forgot-password", rateLimitByUser(RATE_LIMIT_ACTION.FORGOT_PASSWORD), controller.forgotPassword);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  rateLimitByUser(RATE_LIMIT_ACTION.RESET_PASSWORD),
  controller.resetPassword
);
router.put("/update-profile/:id", auth, controller.updateProfile);

export default router;

