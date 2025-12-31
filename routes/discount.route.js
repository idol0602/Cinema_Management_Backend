import { Router } from "express";
import * as controller from "../controllers/discount.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createDiscountSchema,
  updateDiscountSchema,
} from "../validators/discount.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post(
  "/",
  auth,
  authorize("ADMIN", "STAFF"),
  validate(createDiscountSchema),
  controller.create
);
router.put(
  "/:id",
  auth,
  authorize("ADMIN", "STAFF"),
  validate(updateDiscountSchema),
  controller.update
);
router.delete("/:id", auth, authorize("ADMIN"), controller.remove);

export default router;
