import { Router } from "express";
import * as controller from "../controllers/seat.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createSeatSchema,
  updateSeatSchema,
} from "../validators/seat.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post(
  "/",
  auth,
  authorize("ADMIN"),
  validate(createSeatSchema),
  controller.create
);
router.put(
  "/:id",
  auth,
  authorize("ADMIN"),
  validate(updateSeatSchema),
  controller.update
);
router.delete("/:id", auth, authorize("ADMIN"), controller.remove);

export default router;
