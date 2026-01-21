import { Router } from "express";
import * as controller from "../controllers/seat_type.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  createSeatTypeSchema,
  updateSeatTypeSchema,
} from "../validators/seat_type.schema.js";

const router = Router();

router.get("/", auth, authorize("ADMIN"), controller.findAndPaginate);
router.get("/all", auth, authorize("ADMIN"), controller.getAll);
router.get("/:id", auth, authorize("ADMIN"), controller.getById);

router.post(
  "/",
  auth,
  authorize("ADMIN"),
  validate(createSeatTypeSchema),
  controller.create,
);

router.put(
  "/:id",
  auth,
  authorize("ADMIN"),
  validate(updateSeatTypeSchema),
  controller.update,
);

router.delete("/:id", auth, authorize("ADMIN"), controller.remove);

export default router;
