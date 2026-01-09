import * as service from "../services/agent.service.js";
import { success, fail } from "../utils/response.js";

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
