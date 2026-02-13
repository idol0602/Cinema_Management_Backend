import { Router } from "express";
import * as controller from "../controllers/format.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  createFormatSchema,
  updateFormatSchema,
} from "../validators/format.schema.js";
import { METHODS } from "../utils/method.js";
import { rateLimitByUser } from "../middlewares/rateLimit.middleware.js";
import { RATE_LIMIT_ACTION } from "../utils/rateLimitAction.js";

const rootPath = "/formats";
const router = Router();

router.get(
  "/",
  // auth,
  // authorize(rootPath, METHODS.GET),
  controller.findAndPaginate,
);
router.get(
  "/all",
  // auth,
  // authorize(rootPath + "/all", METHODS.GET),
  controller.getAll,
);
router.get(
  "/:id",
  // auth,
  // authorize(rootPath + "/:id", METHODS.GET),
  controller.getById,
);

router.post(
  "/",
  auth,
  authorize(rootPath, METHODS.POST),
  rateLimitByUser(RATE_LIMIT_ACTION.CREATE_FORMAT),
  validate(createFormatSchema),
  controller.create,
);

router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  rateLimitByUser(RATE_LIMIT_ACTION.UPDATE_FORMAT),
  validate(updateFormatSchema),
  controller.update,
);

router.delete(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.DELETE),
  rateLimitByUser(RATE_LIMIT_ACTION.DELETE_FORMAT),
  controller.remove,
);

export default router;
