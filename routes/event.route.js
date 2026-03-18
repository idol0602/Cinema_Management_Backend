import { Router } from "express";
import * as controller from "../controllers/event.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createEventSchema,
  updateEventSchema,
} from "../validators/event.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { eventUpload } from "../middlewares/upload.js";
import { METHODS } from "../utils/method.js";
import { rateLimitByUser } from "../middlewares/rateLimit.middleware.js";
import { RATE_LIMIT_ACTION } from "../utils/rateLimitAction.js";

const rootPath = "/events";
const router = Router();

router.get(
  "/",
  controller.findAndPaginate,
);
router.get(
  "/all",
  controller.getAll,
);
router.get(
  "/:id",
  controller.getById,
);
router.post(
  "/",
  auth,
  authorize(rootPath, METHODS.POST),
  rateLimitByUser(RATE_LIMIT_ACTION.CREATE_EVENT),
  eventUpload.single("image"),
  validate(createEventSchema),
  controller.create,
);
router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  rateLimitByUser(RATE_LIMIT_ACTION.UPDATE_EVENT),
  eventUpload.single("image"),
  validate(updateEventSchema),
  controller.update,
);
router.delete(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.DELETE),
  rateLimitByUser(RATE_LIMIT_ACTION.DELETE_EVENT),
  controller.remove,
);

export default router;
