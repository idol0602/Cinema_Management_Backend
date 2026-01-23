import { Router } from "express";
import * as controller from "../controllers/rate.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createRateSchema,
  updateRateSchema,
} from "../validators/rate.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { METHODS } from "../utils/method.js";

const rootPath = "/rates";
const router = Router();

router.get("/", controller.findAndPaginate);
router.get("/all", controller.getAll);
router.get("/:id", controller.getById);
router.post(
  "/",
  auth,
  authorize(rootPath, METHODS.POST),
  validate(createRateSchema),
  controller.create,
);
router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  validate(updateRateSchema),
  controller.update,
);

export default router;
