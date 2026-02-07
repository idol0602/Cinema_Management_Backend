import { Router } from "express";
import * as controller from "../controllers/seat.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createSeatSchema,
  updateSeatSchema,
} from "../validators/seat.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { uploadExcel } from "../middlewares/upload.middleware.js";
import { METHODS } from "../utils/method.js";
import { rateLimitByUser } from "../middlewares/rateLimit.middleware.js";
import { RATE_LIMIT_ACTION } from "../utils/rateLimitAction.js";

const rootPath = "/seats";
const router = Router();

router.get("/room/:id", controller.getSeatByRoomId);
router.get("/:id", controller.getById);
router.get("/all", controller.getAll);
router.get("/", controller.findAndPaginate);

router.post(
  "/",
  auth,
  authorize(rootPath, METHODS.POST),
  rateLimitByUser(RATE_LIMIT_ACTION.CREATE_SEAT),
  validate(createSeatSchema),
  controller.create,
);

router.post(
  "/import",
  auth,
  authorize(rootPath + "/import", METHODS.POST),
  rateLimitByUser(RATE_LIMIT_ACTION.CREATE_SEAT),
  uploadExcel.single("file"),
  controller.importFromExcel,
);

router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  rateLimitByUser(RATE_LIMIT_ACTION.UPDATE_SEAT),
  validate(updateSeatSchema),
  controller.update,
);
router.delete(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.DELETE),
  rateLimitByUser(RATE_LIMIT_ACTION.DELETE_SEAT),
  controller.remove,
);

export default router;
