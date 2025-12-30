import { Router } from "express";
import * as controller from "../controllers/combo_item_in_tickets.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createComboItemInTicketSchema, updateComboItemInTicketSchema } from "../validators/combo_item_in_tickets.schema.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", validate(createComboItemInTicketSchema), controller.create);
router.put("/:id", validate(updateComboItemInTicketSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;
