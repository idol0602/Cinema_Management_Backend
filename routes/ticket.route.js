import { Router } from "express";
import * as controller from "../controllers/ticket.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createTicketSchema, updateTicketSchema } from "../validators/ticket.schema.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", validate(createTicketSchema), controller.create);
router.put("/:id", validate(updateTicketSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;
