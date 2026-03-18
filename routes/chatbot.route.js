import { Router } from "express";
import { chatWithBot } from "../controllers/chatbot.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { chatWithBotSchema } from "../validators/chat_bot_body.schema.js";
import { rateLimitByIP } from "../middlewares/rateLimit.middleware.js";
import { RATE_LIMIT_ACTION } from "../utils/rateLimitAction.js";

const router = Router();

router.post("/chat", validate(chatWithBotSchema), rateLimitByIP(RATE_LIMIT_ACTION.CHATBOT), chatWithBot);

export default router;