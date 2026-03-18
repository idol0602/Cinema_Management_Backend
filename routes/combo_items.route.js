import { Router } from "express";
import * as controller from "../controllers/combo_items.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createComboItemSchema,
  updateComboItemSchema,
} from "../validators/combo_items.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { METHODS } from "../utils/method.js";

const rootPath = "/combo-items";
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
  validate(createComboItemSchema),
  controller.create,
);
router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  validate(updateComboItemSchema),
  controller.update,
);
router.delete(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.DELETE),
  controller.remove,
);

export default router;
