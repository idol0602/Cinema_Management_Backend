import { Router } from "express";
import * as controller from "../controllers/rate.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createRateSchema,
  updateRateSchema,
} from "../validators/rate.schema.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", auth, validate(createRateSchema), controller.create);
router.put("/:id", auth, validate(updateRateSchema), controller.update);
router.delete("/:id", auth, controller.remove);

export default router;
