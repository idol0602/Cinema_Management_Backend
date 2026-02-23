import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import * as controller from "../controllers/order.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  createOrderSchema,
  updateOrderSchema,
  processOrderSchema,
  createPaymentUrlSchema,
  createOrderWithRelatedDataSchema,
} from "../validators/order.schema.js";
import { METHODS } from "../utils/method.js";
import { rateLimitByUser } from "../middlewares/rateLimit.middleware.js";
import { RATE_LIMIT_ACTION } from "../utils/rateLimitAction.js";

const rootPath = "/orders";
const router = Router();

router.get("/", auth, controller.findAndPaginate);
router.get("/all", auth, controller.getAll);
router.get("/history", auth, controller.getOrderHistory);
router.get("/detail/:id", auth, controller.getOrderDetails);
router.get("/:id", auth, controller.getById);

router.post(
  "/create-payment-url",
  auth,
  authorize(rootPath, METHODS.POST),
  rateLimitByUser(RATE_LIMIT_ACTION.CREATE_PAYMENT_URL),
  validate(createPaymentUrlSchema),
  controller.createPaymentUrl,
);
router.post(
  "/",
  auth,
  authorize(rootPath, METHODS.POST),
  rateLimitByUser(RATE_LIMIT_ACTION.CREATE_ORDER),
  validate(createOrderWithRelatedDataSchema),
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
  rateLimitByUser(RATE_LIMIT_ACTION.PROCESS_ORDER),
  validate(processOrderSchema),
  controller.handleOrderAndRelatedData,
);

export default router;
