import { Router } from "express";
import * as controller from "../controllers/movie.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  createMovieWithTypesSchema,
  updateMovieWithTypesSchema,
  // createMovieSchema,
  // updateMovieSchema,
} from "../validators/movie.schema.js";
import { uploadExcel } from "../middlewares/upload.middleware.js";
import { movieUpload } from "../middlewares/upload.js";
import { METHODS } from "../utils/method.js";
import { rateLimitByUser } from "../middlewares/rateLimit.middleware.js";
import { RATE_LIMIT_ACTION } from "../utils/rateLimitAction.js";

const rootPath = "/movies";
const router = Router();

router.get(
  "/all",
  // auth,
  // authorize(rootPath + "/all", METHODS.GET),
  controller.getAll,
);
router.get("/now-showing", controller.findNowShowing);
router.get("/coming-soon", controller.findComingSoon);
router.get("/name", controller.getByName);
router.get(
  "/:id",
  // auth,
  // authorize(rootPath + "/:id", METHODS.GET),
  controller.getById,
);
router.get(
  "/",
  // auth,
  // authorize(rootPath, METHODS.GET),
  controller.findAndPaginate,
);

router.post(
  "/",
  auth,
  authorize(rootPath, METHODS.POST),
  rateLimitByUser(RATE_LIMIT_ACTION.CREATE_MOVIE),
  movieUpload.single("image"),
  validate(createMovieWithTypesSchema),
  controller.create,
);

router.post(
  "/import",
  auth,
  authorize(rootPath + "/import", METHODS.POST),
  rateLimitByUser(RATE_LIMIT_ACTION.CREATE_MOVIE),
  uploadExcel.single("file"),
  controller.importFromExcel,
);

router.put(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.PUT),
  rateLimitByUser(RATE_LIMIT_ACTION.UPDATE_MOVIE),
  movieUpload.single("image"),
  validate(updateMovieWithTypesSchema),
  controller.update,
);

router.delete(
  "/:id",
  auth,
  authorize(rootPath + "/:id", METHODS.DELETE),
  rateLimitByUser(RATE_LIMIT_ACTION.DELETE_MOVIE),
  controller.remove,
);

export default router;
