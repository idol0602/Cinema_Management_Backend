import { Router } from "express";
import * as controller from "../controllers/rate.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createRateSchema, updateRateSchema } from "../validators/rate.schema.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", validate(createRateSchema), controller.create);
router.put("/:id", validate(updateRateSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;
