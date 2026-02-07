import { Router } from "express";
import * as controller from "../controllers/comment.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../validators/comment.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { METHODS } from "../utils/method.js";
import { rateLimitByUser } from "../middlewares/rateLimit.middleware.js";
import { RATE_LIMIT_ACTION } from "../utils/rateLimitAction.js";

const router = Router();

router.get("/", auth, controller.findAndPaginate);
router.get("/all", auth, controller.getAll);
router.get("/:id", auth, controller.getById);
router.post(
  "/",
  auth,
  rateLimitByUser(RATE_LIMIT_ACTION.CREATE_COMMENT),
  validate(createCommentSchema),
  controller.create,
);
router.put("/:id", auth, validate(updateCommentSchema), controller.update);
router.delete("/:id", auth, controller.remove);

export default router;
