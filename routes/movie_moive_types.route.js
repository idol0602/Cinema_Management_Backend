import { Router } from "express";
import * as controller from "../controllers/movie_movie_types.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createMovieMovieTypeSchema,
  updateMovieMovieTypeSchema,
} from "../validators/movie_movie_types.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { METHODS } from "../utils/method.js";

const rootPath = "/movie-movie-types";
const router = Router();

router.get(
  "/",
  // auth,
  // authorize(rootPath, METHODS.GET),
  controller.findAndPaginate,
);
router.get(
  "/all",
  // auth,
  // authorize(rootPath + "/all", METHODS.GET),
  controller.getAll,
);
router.get(
  "/:id",
  // auth,
  // authorize(rootPath + "/:id", METHODS.GET),
  controller.getById,
);
router.post(
  "/",
  auth,
  authorize(rootPath, METHODS.POST),
  validate(createMovieMovieTypeSchema),
  controller.create,
);
router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  validate(updateMovieMovieTypeSchema),
  controller.update,
);
router.delete(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.DELETE),
  controller.remove,
);

export default router;
