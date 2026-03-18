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
import { rateLimitByUser } from "../middlewares/rateLimit.middleware.js";
import { RATE_LIMIT_ACTION } from "../utils/rateLimitAction.js";

const rootPath = "/menu-items";
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
  rateLimitByUser(RATE_LIMIT_ACTION.CREATE_MENU_ITEM),
  menuItemUpload.single("image"),
  validate(createMenuItemSchema),
  controller.create,
);
router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  rateLimitByUser(RATE_LIMIT_ACTION.UPDATE_MENU_ITEM),
  menuItemUpload.single("image"),
  validate(updateMenuItemSchema),
  controller.update,
);
router.delete(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.DELETE),
  rateLimitByUser(RATE_LIMIT_ACTION.DELETE_MENU_ITEM),
  controller.remove,
);

export default router;
