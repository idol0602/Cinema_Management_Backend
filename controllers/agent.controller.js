import * as service from "../services/agent.service.js";
import { success, fail } from "../utils/response.js";
import { getIO } from "../config/socket.js";

export const chatWithAgent = async (req, res, next) => {
  try {
    const { data, error } = await service.chatWithAgent(req.body);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Chat success", 201);
  } catch (e) {
    next(e);
  }
};

export const callback = async (req, res, next) => {
  try {
    const body = req.body;
    const data = Array.isArray(body) ? body[0] : body;

    // Process the webhook callback and update booking data BEFORE responding
    const { data: processedData, error } = await service.callback(data);
    if (error) {
      console.error("❌ Callback processing error:", error);
      return fail(res, error);
    }

    // Only emit socket event AFTER database update is confirmed
    const io = getIO();
    io.emit("agent:callback", processedData);

    return success(res, processedData, "Callback received and processed", 200);
  } catch (e) {
    console.error("❌ Callback handler error:", e);
    next(e);
  }
};
