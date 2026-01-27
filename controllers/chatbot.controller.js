import * as service from "../services/chatbot.service.js";
import {success, fail} from "../utils/response.js"

export const chatWithBot = async (req, res, next) => {
  try {
    const { data, error } = await service.chatWithBot(req.body);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Chat success", 201);
  } catch (e) {
    next(e);
  }
};