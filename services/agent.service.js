import { env } from "../config/env.js";
import * as orderRepo from "../repositories/order.repo.js";
import { redis } from "../config/redis.js";

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
    // Webhook callback from n8n might contain both order update AND state update
    const orderId = payload?.order_id || payload?.orderId || payload?.id;
    const userId = payload?.user_id || payload?.userId;
    const stateData = payload?.state;

    // If callback includes state data, save it to Redis (N8N workflow integration)
    if (stateData && userId) {
      const { error: stateError } = await saveAiBookingStateFromCallback(
        userId,
        stateData,
      );
      if (stateError) {
        console.warn(
          "⚠️ Failed to save AI state from callback (non-critical):",
          stateError,
        );
      }
    }

    // Update order with callback data from n8n
    // This ensures booking data is persisted BEFORE socket event is emitted
    if (orderId) {
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
    }

    // If no order_id, just acknowledge the callback
    console.log("✅ Webhook callback received (no order update needed)");
    return { data: payload, error: null };
  } catch (error) {
    console.error("❌ Callback processing error:", error);
    // Return original payload to acknowledge webhook even on error
    return { data: payload, error: null };
  }
};

// Helper: Save AI booking state from N8N callback (with key normalization)
const saveAiBookingStateFromCallback = async (userId, stateData) => {
  try {
    if (!userId) {
      return { data: null, error: "User ID required" };
    }

    // Get current state from Redis
    const current = await redis.get(`ai_booking_state:${userId}`);
    const currentState = current
      ? JSON.parse(current)
      : {
          step: null,
          movieId: null,
          showTimeId: null,
          showTimeSeatIds: [],
          comboIds: [],
          menuItems: [],
          eventId: null,
          paymentMethod: "",
        };

    // Normalize incoming state from N8N (snake_case → camelCase)
    const normalizedState = normalizeStateKeys(stateData);

    // Merge with current state
    const mergedState = {
      ...currentState,
      ...normalizedState,
    };

    console.log("💾 Saving AI booking state from callback:", {
      userId,
      step: mergedState.step,
    });

    // Save to Redis with 24-hour TTL
    await redis.set(`ai_booking_state:${userId}`, JSON.stringify(mergedState), {
      EX: 86400,
    });

    return { data: mergedState, error: null };
  } catch (error) {
    console.error("❌ Error saving AI state from callback:", error);
    return { data: null, error };
  }
};

// Helper: Normalize snake_case to camelCase keys
const normalizeStateKeys = (state) => {
  if (!state || typeof state !== "object") {
    return state;
  }

  const normalized = {};

  const keyMap = {
    step: "step",
    movie_id: "movieId",
    movieId: "movieId",
    show_time_id: "showTimeId",
    showTimeId: "showTimeId",
    show_time_seat_ids: "showTimeSeatIds",
    showTimeSeatIds: "showTimeSeatIds",
    seat_ids: "showTimeSeatIds",
    combo_ids: "comboIds",
    comboIds: "comboIds",
    menu_items: "menuItems",
    menuItems: "menuItems",
    event_id: "eventId",
    eventId: "eventId",
    payment_method: "paymentMethod",
    paymentMethod: "paymentMethod",
  };

  for (const [originalKey, value] of Object.entries(state)) {
    const mappedKey = keyMap[originalKey] || originalKey;
    normalized[mappedKey] = value;
  }

  return normalized;
};
