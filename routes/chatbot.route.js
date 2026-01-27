import { Router } from "express";
import { chatWithBot } from "../controllers/chatbot.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";
import { chatWithBotSchema } from "../validators/chat_bot_body.schema.js";

const router = Router();

router.post("/chat", auth, validate(chatWithBotSchema), chatWithBot);

export default router;