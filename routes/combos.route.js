import { Router } from "express";
import * as controller from "../controllers/combos.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createComboSchema,
  updateComboSchema,
} from "../validators/combos.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { METHODS } from "../utils/method.js";

const rootPath = "/combos";
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
  validate(createComboSchema),
  controller.create,
);
router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  validate(updateComboSchema),
  controller.update,
);
router.delete(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.DELETE),
  controller.remove,
);

export default router;
