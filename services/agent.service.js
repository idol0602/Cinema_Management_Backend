import { env } from "../config/env.js";
import * as orderRepo from "../repositories/order.repo.js";

const URL = env.AGENT_URL;

export const chatWithAgent = async (payload) => {
  const { user_id, message } = payload;
  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id, message }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data from agent");
  }

  const data = await response.json();
  // Agent may return array or single object — normalize to single object
  const result = Array.isArray(data) ? data[0] : data;
  return { data: result };
};

export const callback = async (payload) => {
  try {
    // Webhook callback from n8n should contain order_id or booking_id
    const orderId = payload?.order_id || payload?.orderId || payload?.id;

    if (!orderId) {
      console.warn("⚠️ Callback missing order_id:", payload);
      return { data: payload, error: null };
    }

    // Update order with callback data from n8n
    // This ensures booking data is persisted BEFORE socket event is emitted
    const updatePayload = {
      ...payload,
      id: orderId, // Ensure ID is set
    };

    // Call repository to update order with callback data
    // For example, update payment status, transaction ID, or other booking data
    const { data: updatedOrder, error: updateError } = await orderRepo.update(
      orderId,
      updatePayload,
    );

    if (updateError) {
      console.error(
        "❌ Failed to update order from webhook callback:",
        updateError,
      );
      // Still return the data even if update fails, to acknowledge webhook
      return { data: payload, error: null };
    }

    // Return updated order data for socket emission
    const processedData = {
      ...updatedOrder,
      originalPayload: payload, // Include original callback data
    };

    console.log("✅ Webhook callback processed and order updated:", orderId);
    return { data: processedData, error: null };
  } catch (error) {
    console.error("❌ Callback processing error:", error);
    // Return original payload to acknowledge webhook even on error
    return { data: payload, error: null };
  }
};
