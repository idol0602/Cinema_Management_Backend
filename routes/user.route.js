import { Router } from "express";
import * as controller from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  createUserSchema,
  updateUserSchema,
} from "../validators/user.schema.js";
import { METHODS } from "../utils/method.js";

const rootPath = "/users";
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

router.post("/heartbeat/:id", controller.heartbeat);
router.post(
  "/",
  auth,
  authorize(rootPath, METHODS.POST),
  validate(createUserSchema),
  controller.create,
);

router.put("/online/:id", controller.online);
router.put("/offline/:id", controller.offline);
router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  validate(updateUserSchema),
  controller.update,
);

router.delete(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.DELETE),
  controller.remove,
);

export default router;
