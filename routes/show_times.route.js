import { Router } from "express";
import * as controller from "../controllers/show_times.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createShowTimeSchema, updateShowTimeSchema } from "../validators/show_times.schema.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", validate(createShowTimeSchema), controller.create);
router.put("/:id", validate(updateShowTimeSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;
