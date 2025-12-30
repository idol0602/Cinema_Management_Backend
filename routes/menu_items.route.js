import { Router } from "express";
import * as controller from "../controllers/menu_items.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createMenuItemSchema, updateMenuItemSchema } from "../validators/menu_items.schema.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", validate(createMenuItemSchema), controller.create);
router.put("/:id", validate(updateMenuItemSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;
