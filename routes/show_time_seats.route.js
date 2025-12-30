import { Router } from "express";
import * as controller from "../controllers/show_time_seats.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createShowTimeSeatSchema,
  updateShowTimeSeatSchema,
} from "../validators/show_time_seats.schema.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", validate(createShowTimeSeatSchema), controller.create);
router.put("/:id", validate(updateShowTimeSeatSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;
