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

router.get("/", authorize("CUSTOMER", "STAFF"), controller.getAll);
router.get("/:id", authorize("CUSTOMER", "STAFF"), controller.getById);
router.get(
  "/status/:id",
  authorize("CUSTOMER", "STAFF"),
  auth,
  controller.getStatusSeat
);

router.post(
  "/",
  auth,
  authorize("CUSTOMER", "STAFF"),
  validate(createShowTimeSeatSchema),
  controller.create
);
router.put(
  "/:id",
  auth,
  authorize("CUSTOMER", "STAFF"),
  validate(updateShowTimeSeatSchema),
  controller.update
);
router.delete("/:id", auth, authorize("CUSTOMER", "STAFF"), controller.remove);

export default router;
