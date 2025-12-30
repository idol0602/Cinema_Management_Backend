import { Router } from "express";
import * as controller from "../controllers/comment.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createCommentSchema, updateCommentSchema } from "../validators/comment.schema.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", validate(createCommentSchema), controller.create);
router.put("/:id", validate(updateCommentSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;
