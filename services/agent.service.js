import { env } from "../config/env.js";
const URL = env.AGENT_URL

export const chatWithAgent = async (payload) => {
  const {user_id, message} = payload
  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({user_id, message}),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch data from agent");
  }

  const data = await response.json();
  // Agent may return array or single object — normalize to single object
  const result = Array.isArray(data) ? data[0] : data;
  return { data: result };
};

export const callback = async (payload) => {
  console.log(payload)
  return payload;
};
