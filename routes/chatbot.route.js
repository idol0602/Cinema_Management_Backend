import { Router } from "express";
import { chatWithBot } from "../controllers/chatbot.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";
import { chatWithBotSchema } from "../validators/chat_bot_body.schema.js";
import { rateLimitByUser } from "../middlewares/rateLimit.middleware.js";
import { RATE_LIMIT_ACTION } from "../utils/rateLimitAction.js";

const router = Router();

router.post("/chat", auth, rateLimitByUser(RATE_LIMIT_ACTION.CHATBOT), validate(chatWithBotSchema), chatWithBot);

export default router;