import { Router } from "express";
import * as controller from "../controllers/event_type.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  createEventTypeSchema,
  updateEventTypeSchema,
} from "../validators/event_type.schema.js";
import { METHODS } from "../utils/method.js";

const rootPath = "/event-types";
const router = Router();

router.get(
  "/",
  auth,
  authorize(rootPath, METHODS.GET),
  controller.findAndPaginate,
);
router.get(
  "/all",
  auth,
  authorize(rootPath + "/all", METHODS.GET),
  controller.getAll,
);
router.get(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.GET),
  controller.getById,
);

router.post(
  "/",
  auth,
  authorize(rootPath, METHODS.POST),
  validate(createEventTypeSchema),
  controller.create,
);

router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  validate(updateEventTypeSchema),
  controller.update,
);

router.delete(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.DELETE),
  controller.remove,
);

export default router;
