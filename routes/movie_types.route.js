import { Router } from "express";
import * as controller from "../controllers/movie_type.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createMovieTypeSchema, updateMovieTypeSchema } from "../validators/movie_type.schema.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", validate(createMovieTypeSchema), controller.create);
router.put("/:id", validate(updateMovieTypeSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;
