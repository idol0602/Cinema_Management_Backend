import { Router } from "express";
import * as controller from "../controllers/ticket_price.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createTicketPriceSchema,
  updateTicketPriceSchema,
} from "../validators/ticket_price.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { METHODS } from "../utils/method.js";
import { rateLimitByUser } from "../middlewares/rateLimit.middleware.js";
import { RATE_LIMIT_ACTION } from "../utils/rateLimitAction.js";

const rootPath = "/ticket-prices";
const router = Router();

router.get("/", controller.findAndPaginate);
router.get("/all", controller.getAll);
router.get("/:id", controller.getById);

router.post(
  "/",
  auth,
  authorize(rootPath, METHODS.POST),
  rateLimitByUser(RATE_LIMIT_ACTION.CREATE_TICKET_PRICE),
  validate(createTicketPriceSchema),
  controller.create,
);
router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  rateLimitByUser(RATE_LIMIT_ACTION.UPDATE_TICKET_PRICE),
  validate(updateTicketPriceSchema),
  controller.update,
);
router.delete(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.DELETE),
  rateLimitByUser(RATE_LIMIT_ACTION.DELETE_TICKET_PRICE),
  controller.remove,
);

export default router;
