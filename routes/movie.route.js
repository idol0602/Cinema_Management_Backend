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
import { METHODS } from "../utils/method.js";

const rootPath = "/movies";
const router = Router();

router.get("/name", controller.getByName);
router.get(
  "/",
  auth,
  authorize(rootPath, METHODS.GET),
  controller.findAndPaginate,
);
router.get(
  "/all",
  auth,
  authorize(rootPath + "/all", METHODS.GET),
  controller.getAll,
);
router.get(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.GET),
  controller.getById,
);

router.post(
  "/",
  auth,
  authorize(rootPath, METHODS.POST),
  validate(createMovieSchema),
  controller.create,
);

router.post(
  "/import",
  auth,
  authorize(rootPath + "/import", METHODS.POST),
  uploadExcel.single("file"),
  controller.importFromExcel,
);

router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  validate(updateMovieSchema),
  controller.update,
);

router.delete(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.DELETE),
  controller.remove,
);

export default router;
