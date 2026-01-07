import { Router } from "express";
import * as controller from "../controllers/show_times.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createShowTimeSchema,
  updateShowTimeSchema,
} from "../validators/show_times.schema.js";
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
  validate(createShowTimeSchema),
  controller.create
);
router.put(
  "/:id",
  auth,
  authorize("ADMIN"),
  validate(updateShowTimeSchema),
  controller.update
);
router.delete("/:id", auth, authorize("ADMIN"), controller.remove);

export default router;
