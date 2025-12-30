import { Router } from "express";
import * as controller from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.schema.js";

const router = Router();

router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);

export default router;
