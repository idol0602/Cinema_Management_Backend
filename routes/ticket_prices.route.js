import { Router } from "express";
import * as controller from "../controllers/ticket_price.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createTicketPriceSchema,
  updateTicketPriceSchema,
} from "../validators/ticket_price.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);

router.post(
  "/",
  auth,
  authorize("ADMIN"),
  validate(createTicketPriceSchema),
  controller.create
);
router.put(
  "/:id",
  auth,
  authorize("ADMIN"),
  validate(updateTicketPriceSchema),
  controller.update
);
router.delete("/:id", auth, authorize("ADMIN"), controller.remove);

export default router;
