import { Router } from "express";
import * as controller from "../controllers/event_type.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  createEventTypeSchema,
  updateEventTypeSchema,
} from "../validators/event_type.schema.js";

const router = Router();

router.get("/", auth, authorize("ADMIN"), controller.findAndPaginate);
router.get("/all", auth, authorize("ADMIN"), controller.getAll);
router.get("/:id", auth, authorize("ADMIN"), controller.getById);

router.post(
  "/",
  auth,
  authorize("ADMIN"),
  validate(createEventTypeSchema),
  controller.create,
);

router.put(
  "/:id",
  auth,
  authorize("ADMIN"),
  validate(updateEventTypeSchema),
  controller.update,
);

router.delete("/:id", auth, authorize("ADMIN"), controller.remove);

export default router;
