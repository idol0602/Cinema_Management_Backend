import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import * as controller from "../controllers/order.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  createOrderSchema,
  updateOrderSchema,
  processOrderSchema,
} from "../validators/order.schema.js";
import { METHODS } from "../utils/method.js";

const rootPath = "/orders";
const router = Router();

router.get("/", auth, controller.findAndPaginate);
router.get("/all", auth, controller.getAll);
router.get("/:id", auth, controller.getById);
router.get("/detail/:id", auth, controller.getOrderDetails);

router.post(
  "/",
  auth,
  authorize(rootPath, METHODS.POST),
  validate(createOrderSchema),
  controller.create,
);
router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  validate(updateOrderSchema),
  controller.update,
);

router.post(
  "/process",
  auth,
  authorize(rootPath, METHODS.POST),
  validate(processOrderSchema),
  controller.handleOrderAndRelatedData,
);

export default router;
