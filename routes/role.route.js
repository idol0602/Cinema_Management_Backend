import { Router } from "express";
import * as controller from "../controllers/role.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  createRoleSchema,
  updateRoleSchema,
} from "../validators/role.schema.js";
import { METHODS } from "../utils/method.js";

const rootPath = "/roles";
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
  validate(createRoleSchema),
  controller.create,
);

router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  validate(updateRoleSchema),
  controller.update,
);

router.delete(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.DELETE),
  controller.remove,
);

export default router;
