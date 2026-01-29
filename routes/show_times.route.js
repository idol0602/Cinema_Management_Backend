import { Router } from "express";
import * as controller from "../controllers/show_times.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createShowTimeSchema,
  updateShowTimeSchema,
  bulkCreateShowTimeSchema,
} from "../validators/show_times.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { METHODS } from "../utils/method.js";

const rootPath = "/show-times";
const router = Router();

router.get("/rooms-and-date", controller.findByRoomIdsAndDates);
router.get("/details/:id", controller.getShowTimeDetails);
router.get("/room/:id", controller.getByRoomId);
router.get("/", controller.findAndPaginate);
router.get("/all", controller.getAll);
router.get("/:id", controller.getById);

router.post(
  "/bulk-create",
  auth,
  authorize(rootPath + "/bulk-create", METHODS.POST),
  validate(bulkCreateShowTimeSchema),
  controller.bulkCreate,
);
router.post(
  "/",
  auth,
  authorize(rootPath, METHODS.POST),
  validate(createShowTimeSchema),
  controller.create,
);
router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  validate(updateShowTimeSchema),
  controller.update,
);
router.delete(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.DELETE),
  controller.remove,
);

export default router;
