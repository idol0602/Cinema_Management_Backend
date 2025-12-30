import { Router } from "express";
import * as controller from "../controllers/seat.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createSeatSchema, updateSeatSchema } from "../validators/seat.schema.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", validate(createSeatSchema), controller.create);
router.put("/:id", validate(updateSeatSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;
