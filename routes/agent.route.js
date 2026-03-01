import { Router } from "express";
import * as controller from "../controllers/agent.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { chatWithAgentSchema } from "../validators/chat_agent_body.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { METHODS } from "../utils/method.js";
import { rateLimitByUser } from "../middlewares/rateLimit.middleware.js";
import { RATE_LIMIT_ACTION } from "../utils/rateLimitAction.js";

const rootPath = "/agent";
const router = Router();

router.post(
  "/",
  auth,
  authorize(rootPath, METHODS.POST),
  rateLimitByUser(RATE_LIMIT_ACTION.CHATBOT),
  validate(chatWithAgentSchema),
  controller.chatWithAgent,
);

router.post("/callback", controller.callback);

export default router;
