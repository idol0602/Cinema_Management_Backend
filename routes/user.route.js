import { Router } from "express";
import * as controller from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  createUserSchema,
  updateUserSchema,
} from "../validators/user.schema.js";

const router = Router();

router.get("/", controller.findAndPaginate);
router.get("/all", controller.getAll);
router.get("/:id", controller.getById);

router.post(
  "/",
  auth,
  authorize("ADMIN", "STAFF"),
  validate(createUserSchema),
  controller.create
);

router.put(
  "/:id",
  auth,
  authorize("ADMIN", "STAFF"),
  validate(updateUserSchema),
  controller.update
);

router.delete("/:id", auth, authorize("ADMIN"), controller.remove);

export default router;
