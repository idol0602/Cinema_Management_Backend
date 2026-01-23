import { Router } from "express";
import * as controller from "../controllers/room.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  createRoomSchema,
  updateRoomSchema,
} from "../validators/room.schema.js";
import { METHODS } from "../utils/method.js";

const rootPath = "/rooms";
const router = Router();

router.get("/", controller.findAndPaginate);
router.get("/all", controller.getAll);
router.get("/:id", controller.getById);

router.post(
  "/",
  auth,
  authorize(rootPath, METHODS.POST),
  validate(createRoomSchema),
  controller.create,
);

router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  validate(updateRoomSchema),
  controller.update,
);

router.delete(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.DELETE),
  controller.remove,
);

export default router;
