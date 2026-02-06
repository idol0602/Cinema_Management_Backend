import { Router } from "express";
import * as controller from "../controllers/menu_items.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createMenuItemSchema,
  updateMenuItemSchema,
} from "../validators/menu_items.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { menuItemUpload } from "../middlewares/upload.js";
import { METHODS } from "../utils/method.js";

const rootPath = "/menu-items";
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
  menuItemUpload.single("image"),
  validate(createMenuItemSchema),
  controller.create,
);
router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  menuItemUpload.single("image"),
  validate(updateMenuItemSchema),
  controller.update,
);
router.delete(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.DELETE),
  controller.remove,
);

export default router;
