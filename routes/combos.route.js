import { Router } from "express";
import * as controller from "../controllers/combos.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createComboSchema, updateComboSchema } from "../validators/combos.schema.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", validate(createComboSchema), controller.create);
router.put("/:id", validate(updateComboSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;
