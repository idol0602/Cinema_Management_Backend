import { env } from "../config/env.js";
const AGENT_TIMEOUT_MS = 120000;

export const chatWithAgent = async (payload) => {
  const URL = env.AGENT_URL;
  try {
    const { question, session_id } = payload;
    if (!URL || !question || !session_id) {
      return {
        data: {},
        error: new Error("missing URL or message or sessionId"),
      };
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AGENT_TIMEOUT_MS);

    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question,
        session_id: session_id,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0 && data[0].output) {
      return {
        data: data[0].output,
        error: null,
      };
    } else if (typeof data === 'object' && data.output) {
      // Handle single object response
      return {
        data: data.output,
        error: null,
      };
    } else {
      console.error(`[Agent] Unexpected response format:`, data);
      throw new Error(`Webhook unexpected response format`);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`[Agent] Request timed out after ${AGENT_TIMEOUT_MS / 1000}s`);
      return {
        data: {},
        error: new Error(`Request timed out. n8n is taking too long to respond (>${AGENT_TIMEOUT_MS / 1000}s)`),
      };
    }
    console.error(`[Agent] Error:`, error);
    return {
      data: {},
      error: error,
    };
  }
};
