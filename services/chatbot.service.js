import { env } from "../config/env.js";

export const chatWithBot = async (payload) => {
  const URL = env.CHAT_BOT_URL;
  try {
    const { message, sessionId } = payload;
    if (!URL || !message || !sessionId) {
      return {
        data: {},
        error: new Error("missing URL or message or sessiondId"),
      };
    }

    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message,
        sessionId: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status}`);
    }
    const data = await response.json()
    return {
      data: data.output,
      error: null,
    };
  } catch (error) {
    return {
      data: {},
      error: error,
    };
  }
};