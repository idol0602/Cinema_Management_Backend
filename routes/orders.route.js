import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import * as controller from "../controllers/order.controller.js";
import { auth } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import {
  createOrderSchema,
  updateOrderSchema,
} from "../validators/order.schema";

const router = Router();

router.get("/", auth, controller.findAndPaginate);
router.get("/all", auth, controller.getAll);
router.get("/:id", auth, controller.getById);

router.post(
  "/",
  auth,
  authorize("STAFF", "CUSTOMER"),
  validate(createOrderSchema),
  controller.create
);
router.put(
  "/:id",
  auth,
  authorize("STAFF", "CUSTOMER"),
  validate(updateOrderSchema),
  controller.update
);

export default router;
