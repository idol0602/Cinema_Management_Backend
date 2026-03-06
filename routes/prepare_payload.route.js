import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import * as controller from "../controllers/prepare_payload.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { preparePayloadForCreateSchema } from "../validators/prepare_payload.schema.js";

const router = Router();

router.post(
  "/create",
  auth,
  validate(preparePayloadForCreateSchema),
  controller.preparePayloadForCreate,
);

export default router;
