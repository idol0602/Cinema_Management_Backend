import { Router } from "express";
import * as controller from "../controllers/agent.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { chatWithAgentSchema } from "../validators/chat_agent_body.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { METHODS } from "../utils/method.js";

const rootPath = "/agent";
const router = Router();

router.post(
  "/",
  auth,
  authorize(rootPath, METHODS.POST),
  validate(chatWithAgentSchema),
  controller.chatWithAgent,
);

export default router;
