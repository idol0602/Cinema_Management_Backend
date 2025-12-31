import { Router } from "express";
import * as controller from "../controllers/ticket.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createTicketSchema,
  updateTicketSchema,
} from "../validators/ticket.schema.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", auth, validate(createTicketSchema), controller.create);
router.put("/:id", auth, validate(updateTicketSchema), controller.update);
router.delete("/:id", auth, controller.remove);

export default router;
