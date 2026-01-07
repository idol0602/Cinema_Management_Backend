import { Router } from "express";
import * as controller from "../controllers/movie.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  createMovieSchema,
  updateMovieSchema,
} from "../validators/movie.schema.js";
import { uploadExcel } from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/", controller.findAndPaginate);
router.get("/all", controller.getAll);
router.get("/:id", controller.getById);

router.post(
  "/",
  auth,
  authorize("ADMIN"),
  validate(createMovieSchema),
  controller.create
);

router.post(
  "/import",
  auth,
  authorize("ADMIN"),
  uploadExcel.single("file"),
  controller.importFromExcel
);

router.put(
  "/:id",
  auth,
  authorize("ADMIN"),
  validate(updateMovieSchema),
  controller.update
);

router.delete("/:id", auth, authorize("ADMIN"), controller.remove);

export default router;
