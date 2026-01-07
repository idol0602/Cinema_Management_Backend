import { Router } from "express";
import * as controller from "../controllers/agent.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { chatWithAgentSchema } from "../validators/chat_agent_body.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

router.post(
  "/",
  auth,
  authorize("ADMIN"),
  validate(chatWithAgentSchema),
  controller.chatWithAgent
);

export default router;
