import { env } from "../config/env.js";

const extractBotMessage = (payload) => {
  if (typeof payload === "string") {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload
      .map((item) => {
        if (typeof item === "string") return item;
        if (
          item &&
          typeof item === "object" &&
          typeof item.message === "string"
        ) {
          return item.message;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n\n");
  }

  if (payload && typeof payload === "object") {
    if (typeof payload.message === "string") return payload.message;
    if (Array.isArray(payload.output)) return extractBotMessage(payload.output);
  }

  return "";
};

export const chatWithBot = async (payload) => {
  const URL = env.CHAT_BOT_URL;
  try {
    const { message, user_id } = payload;
    if (!URL || !message || !user_id) {
      return {
        data: {},
        error: new Error("missing URL or message or user_id"),
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout

    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        user_id,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status}`);
    }
    const data = await response.json();
    const normalizedMessage = extractBotMessage(data);

    return {
      data: normalizedMessage,
      error: null,
    };
  } catch (error) {
    return {
      data: {},
      error: error,
    };
  }
};
