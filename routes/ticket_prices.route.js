import { Router } from "express";
import * as controller from "../controllers/ticket_price.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createTicketPriceSchema, updateTicketPriceSchema } from "../validators/ticket_price.schema.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", validate(createTicketPriceSchema), controller.create);
router.put("/:id", validate(updateTicketPriceSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;
