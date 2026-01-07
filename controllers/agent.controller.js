import * as service from "../services/agent.service.js";
import { success } from "../utils/response.js";

export const chatWithAgent = async (req, res, next) => {
  try {
    const { data, error } = await service.chatWithAgent(req.body);
    if (error) throw error;
    return success(res, data, "Chat success", 201);
  } catch (e) {
    next(e);
  }
};
