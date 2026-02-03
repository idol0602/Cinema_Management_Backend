import { Router } from "express";
import * as controller from "../controllers/show_time_seats.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createShowTimeSeatSchema,
  updateShowTimeSeatSchema,
} from "../validators/show_time_seats.schema.js";
import {
  holdSeatSchema,
  bulkHoldSeatsSchema,
  bulkCancelHoldSeatsSchema,
} from "../validators/hold_seat.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { METHODS } from "../utils/method.js";

const rootPath = "/show-time-seats";
const router = Router();

router.get("/", authorize(rootPath, METHODS.GET), controller.findAndPaginate);
router.get(
  "/all",
  authorize(rootPath + "/all", METHODS.GET),
  controller.getAll,
);
router.get(
  "/:id",
  authorize(rootPath + "/:id", METHODS.GET),
  controller.getById,
);
router.get(
  "/status/:id",
  authorize(rootPath + "/status/:id", METHODS.GET),
  auth,
  controller.getStatusSeat,
);

router.post(
  "/",
  auth,
  authorize(rootPath, METHODS.POST),
  validate(createShowTimeSeatSchema),
  controller.create,
);
router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  validate(updateShowTimeSeatSchema),
  controller.update,
);
router.delete(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.DELETE),
  controller.remove,
);

// Seat hold routes - BULK OPERATIONS MUST COME BEFORE :id ROUTES
router.post(
  "/hold/bulk",
  auth,
  validate(bulkHoldSeatsSchema),
  controller.bulkHoldSeats,
);

router.delete(
  "/hold/bulk",
  auth,
  validate(bulkCancelHoldSeatsSchema),
  controller.bulkCancelHoldSeats,
);

// Single seat hold operations
router.post(
  "/hold/:id",
  auth,
  validate(holdSeatSchema),
  controller.holdSeat,
);

router.delete(
  "/hold/:id",
  auth,
  controller.cancelHoldSeat,
);

router.get(
  "/hold/:id",
  auth,
  controller.getHoldInfo,
);

export default router;
