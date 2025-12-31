import { Router } from "express";
import * as controller from "../controllers/room.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  createRoomSchema,
  updateRoomSchema,
} from "../validators/room.schema.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);

router.post(
  "/",
  auth,
  authorize("ADMIN", "STAFF"),
  validate(createRoomSchema),
  controller.create
);

router.put(
  "/:id",
  auth,
  authorize("ADMIN", "STAFF"),
  validate(updateRoomSchema),
  controller.update
);

router.delete("/:id", auth, authorize("ADMIN"), controller.remove);

export default router;
