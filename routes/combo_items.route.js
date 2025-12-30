import { Router } from "express";
import * as controller from "../controllers/combo_items.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createComboItemSchema, updateComboItemSchema } from "../validators/combo_items.schema.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", validate(createComboItemSchema), controller.create);
router.put("/:id", validate(updateComboItemSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;
