import { Router } from "express";
import * as controller from "../controllers/menu_item_in_tickets.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createMenuItemInTicketSchema,
  updateMenuItemInTicketSchema,
} from "../validators/menu_item_in_tickets.schema.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", validate(createMenuItemInTicketSchema), controller.create);
router.put("/:id", validate(updateMenuItemInTicketSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;
