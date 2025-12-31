import { Router } from "express";
import * as controller from "../controllers/show_time_seats.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createShowTimeSeatSchema,
  updateShowTimeSeatSchema,
} from "../validators/show_time_seats.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post(
  "/",
  auth,
  authorize("ADMIN", "STAFF"),
  validate(createShowTimeSeatSchema),
  controller.create
);
router.put(
  "/:id",
  auth,
  authorize("ADMIN", "STAFF"),
  validate(updateShowTimeSeatSchema),
  controller.update
);
router.delete("/:id", auth, authorize("ADMIN"), controller.remove);
router.get("/status/:id", controller.getStatusSeat);

export default router;
