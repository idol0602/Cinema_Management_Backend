import { Router } from "express";
import * as controller from "../controllers/slide.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createSlideSchema, updateSlideSchema } from "../validators/slide.schema.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", validate(createSlideSchema), controller.create);
router.put("/:id", validate(updateSlideSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;
