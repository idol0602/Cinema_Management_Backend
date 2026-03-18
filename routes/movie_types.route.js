import { Router } from "express";
import * as controller from "../controllers/movie_type.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createMovieTypeSchema,
  updateMovieTypeSchema,
} from "../validators/movie_type.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { METHODS } from "../utils/method.js";
import { rateLimitByUser } from "../middlewares/rateLimit.middleware.js";
import { RATE_LIMIT_ACTION } from "../utils/rateLimitAction.js";

const rootPath = "/movie-types";
const router = Router();

router.get(
  "/",
  controller.findAndPaginate,
);
router.get(
  "/all",
  controller.getAll,
);
router.get(
  "/:id",
  controller.getById,
);
router.post(
  "/",
  auth,
  authorize(rootPath, METHODS.POST),
  rateLimitByUser(RATE_LIMIT_ACTION.CREATE_MOVIE_TYPE),
  validate(createMovieTypeSchema),
  controller.create,
);
router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  rateLimitByUser(RATE_LIMIT_ACTION.UPDATE_MOVIE_TYPE),
  validate(updateMovieTypeSchema),
  controller.update,
);
router.delete(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.DELETE),
  rateLimitByUser(RATE_LIMIT_ACTION.DELETE_MOVIE_TYPE),
  controller.remove,
);

export default router;
