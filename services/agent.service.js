import { env } from "../config/env.js";

export const chatWithAgent = async (payload) => {
  const URL = env.AGENT_URL;
  try {
    const { question, session_id } = payload;
    if (!URL || !question || !session_id) {
      return {
        data: {},
        error: new Error("missing URL or message or sessiondId"),
      };
    }

    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question,
        session_id: session_id,
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0 && data[0].output) {
      return {
        data: data[0].output,
        error: null,
      };
    } else throw new Error(`Webhook error format: ${data}`);
  } catch (error) {
    return {
      data: {},
      error: error,
    };
  }
};
