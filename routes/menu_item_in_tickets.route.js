import { Router } from "express";
import * as controller from "../controllers/menu_item_in_tickets.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  createMenuItemInTicketSchema,
  updateMenuItemInTicketSchema,
} from "../validators/menu_item_in_tickets.schema.js";

const router = Router();

router.get("/", auth, authorize("STAFF", "CUSTOMER"), controller.getAll);
router.get("/:id", auth, authorize("STAFF", "CUSTOMER"), controller.getById);
router.post(
  "/",
  auth,
  authorize("STAFF", "CUSTOMER"),
  validate(createMenuItemInTicketSchema),
  controller.create
);
router.put(
  "/:id",
  auth,
  authorize("STAFF", "CUSTOMER"),
  validate(updateMenuItemInTicketSchema),
  controller.update
);
router.delete("/:id", auth, authorize("STAFF", "CUSTOMER"), controller.remove);

export default router;
