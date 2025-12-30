import { Router } from "express";
import * as controller from "../controllers/combos_events.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createComboEventSchema, updateComboEventSchema } from "../validators/combos_events.schema.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", validate(createComboEventSchema), controller.create);
router.put("/:id", validate(updateComboEventSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;
