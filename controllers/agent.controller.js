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
    const io = getIO();
    io.emit("agent:callback", data);

    return success(res, data, "Callback received", 200);
  } catch (e) {
    next(e);
  }
};
