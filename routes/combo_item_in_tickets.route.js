import { Router } from "express";
import * as controller from "../controllers/combo_item_in_tickets.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createComboItemInTicketSchema,
  updateComboItemInTicketSchema,
} from "../validators/combo_item_in_tickets.schema.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", auth, authorize("STAFF", "CUSTOMER"), controller.getAll);
router.get("/:id", auth, authorize("STAFF", "CUSTOMER"), controller.getById);
router.post(
  "/",
  auth,
  authorize("STAFF", "CUSTOMER"),
  validate(createComboItemInTicketSchema),
  controller.create
);
router.put(
  "/:id",
  auth,
  authorize("STAFF", "CUSTOMER"),
  validate(updateComboItemInTicketSchema),
  controller.update
);
router.delete("/:id", auth, authorize("STAFF", "CUSTOMER"), controller.remove);

export default router;
