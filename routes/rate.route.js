import { Router } from "express";
import * as controller from "../controllers/rate.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createRateSchema,
  updateRateSchema,
} from "../validators/rate.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post(
  "/",
  auth,
  authorize("CUSTOMER"),
  validate(createRateSchema),
  controller.create
);
router.put(
  "/:id",
  auth,
  authorize("CUSTOMER"),
  validate(updateRateSchema),
  controller.update
);
router.delete("/:id", authorize("CUSTOMER"), auth, controller.remove);

export default router;
