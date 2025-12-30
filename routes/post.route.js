import { Router } from "express";
import * as controller from "../controllers/post.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createPostSchema, updatePostSchema } from "../validators/post.schema.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", validate(createPostSchema), controller.create);
router.put("/:id", validate(updatePostSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;
