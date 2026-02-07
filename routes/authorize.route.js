import { Router } from "express";
import * as controller from "../controllers/authorize.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  createAuthorizeSchema,
  updateAuthorizeSchema,
} from "../validators/authorize.schema.js";
import { METHODS } from "../utils/method.js";
import { rateLimitByUser } from "../middlewares/rateLimit.middleware.js";
import { RATE_LIMIT_ACTION } from "../utils/rateLimitAction.js";

const rootPath = "/authorizes";
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
router.get(
  "/role/:roleId",
  auth,
  authorize(rootPath + "/role/:roleId", METHODS.GET),
  controller.getByRoleId,
);

router.post(
  "/",
  auth,
  authorize(rootPath, METHODS.POST),
  rateLimitByUser(RATE_LIMIT_ACTION.CREATE_AUTHORIZE),
  validate(createAuthorizeSchema),
  controller.create,
);

router.post(
  "/bulk/create",
  auth,
  authorize(rootPath + "/bulk/create", METHODS.POST),
  rateLimitByUser(RATE_LIMIT_ACTION.CREATE_AUTHORIZE),
  controller.bulkCreate,
);

router.post(
  "/bulk/remove",
  auth,
  authorize(rootPath + "/bulk/remove", METHODS.POST),
  rateLimitByUser(RATE_LIMIT_ACTION.DELETE_AUTHORIZE),
  controller.bulkRemove,
);

router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  rateLimitByUser(RATE_LIMIT_ACTION.UPDATE_AUTHORIZE),
  validate(updateAuthorizeSchema),
  controller.update,
);

router.delete(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.DELETE),
  rateLimitByUser(RATE_LIMIT_ACTION.DELETE_AUTHORIZE),
  controller.remove,
);

export default router;
