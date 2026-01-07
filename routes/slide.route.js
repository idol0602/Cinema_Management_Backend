import { Router } from "express";
import * as controller from "../controllers/slide.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createSlideSchema,
  updateSlideSchema,
} from "../validators/slide.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/", controller.findAndPaginate);
router.get("/all", controller.getAll);
router.get("/:id", controller.getById);

router.post(
  "/",
  auth,
  authorize("ADMIN"),
  validate(createSlideSchema),
  controller.create
);
router.put(
  "/:id",
  auth,
  authorize("ADMIN"),
  validate(updateSlideSchema),
  controller.update
);
router.delete("/:id", auth, authorize("ADMIN"), controller.remove);

export default router;
