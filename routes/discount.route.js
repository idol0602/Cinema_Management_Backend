import { Router } from "express";
import * as controller from "../controllers/discount.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createDiscountSchema, updateDiscountSchema } from "../validators/discount.schema.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", validate(createDiscountSchema), controller.create);
router.put("/:id", validate(updateDiscountSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;
