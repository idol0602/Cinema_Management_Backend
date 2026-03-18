import { Router } from "express";
import * as controller from "../controllers/combo_item_in_tickets.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createComboItemInTicketSchema,
  updateComboItemInTicketSchema,
} from "../validators/combo_item_in_tickets.schema.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";
import { METHODS } from "../utils/method.js";

const rootPath = "/combo-item-in-tickets";
const router = Router();

router.get(
  "/",
  auth,
  controller.findAndPaginate,
);
router.get(
  "/all",
  auth,
  controller.getAll,
);
router.get(
  "/:id",
  auth,
  controller.getById,
);
router.post(
  "/",
  auth,
  validate(createComboItemInTicketSchema),
  controller.create,
);
router.put(
  "/:id",
  auth,
  validate(updateComboItemInTicketSchema),
  controller.update,
);
router.delete(
  "/:id",
  auth,
  controller.remove,
);

export default router;
