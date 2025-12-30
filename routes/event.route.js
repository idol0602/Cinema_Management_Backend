import { Router } from "express";
import * as controller from "../controllers/event.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createEventSchema, updateEventSchema } from "../validators/event.schema.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", validate(createEventSchema), controller.create);
router.put("/:id", validate(updateEventSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;
