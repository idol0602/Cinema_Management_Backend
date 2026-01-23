import { Router } from "express";
import * as controller from "../controllers/event.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createEventSchema,
  updateEventSchema,
} from "../validators/event.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { METHODS } from "../utils/method.js";

const rootPath = "/events";
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
  validate(createEventSchema),
  controller.create,
);
router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  validate(updateEventSchema),
  controller.update,
);
router.delete(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.DELETE),
  controller.remove,
);

export default router;
