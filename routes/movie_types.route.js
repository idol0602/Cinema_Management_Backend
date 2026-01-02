import { Router } from "express";
import * as controller from "../controllers/movie_type.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createMovieTypeSchema,
  updateMovieTypeSchema,
} from "../validators/movie_type.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/", controller.findAndPaginate);
router.get("/all", controller.getAll);
router.get("/:id", controller.getById);
router.post(
  "/",
  auth,
  authorize("ADMIN", "STAFF"),
  validate(createMovieTypeSchema),
  controller.create
);
router.put(
  "/:id",
  auth,
  authorize("ADMIN", "STAFF"),
  validate(updateMovieTypeSchema),
  controller.update
);
router.delete("/:id", auth, authorize("ADMIN"), controller.remove);

export default router;
