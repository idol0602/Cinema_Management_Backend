import { Router } from "express";
import * as controller from "../controllers/ticket.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createTicketSchema,
  updateTicketSchema,
} from "../validators/ticket.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { METHODS } from "../utils/method.js";

const rootPath = "/tickets";
const router = Router();

router.get("/", auth, controller.findAndPaginate);
router.get("/all", auth, controller.getAll);
router.get("/:id", auth, controller.getById);
router.post(
  "/",
  auth,
  authorize(rootPath, METHODS.POST),
  validate(createTicketSchema),
  controller.create,
);
router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  validate(updateTicketSchema),
  controller.update,
);

export default router;
