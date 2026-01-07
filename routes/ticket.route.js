import { Router } from "express";
import * as controller from "../controllers/ticket.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createTicketSchema,
  updateTicketSchema,
} from "../validators/ticket.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/", auth, controller.getAll);
router.get("/:id", auth, controller.getById);
router.post(
  "/",
  auth,
  authorize("CUSTOMER", "STAFF"),
  validate(createTicketSchema),
  controller.create
);
router.put(
  "/:id",
  auth,
  authorize("CUSTOMER", "STAFF"),
  validate(updateTicketSchema),
  controller.update
);
router.delete("/:id", auth, authorize("CUSTOMER", "STAFF"), controller.remove);

export default router;
