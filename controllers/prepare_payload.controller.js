import * as service from "../services/prepare_payload.service.js";
import { success, fail } from "../utils/response.js";

export const preparePayloadForCreate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      movieId,
      showTimeId,
      showTimeSeatIds,
      comboIds,
      menuItems,
      paymentMethod,
      eventId,
    } = req.body;

    const { data, breakdown, error } =
      await service.preparePayloadForCreate({
        userId,
        movieId,
        showTimeId,
        showTimeSeatIds,
        comboIds,
        menuItems,
        paymentMethod,
        eventId,
      });

    if (error) {
      return fail(res, { message: typeof error === "string" ? error : error.message || "Failed to prepare payload" });
    }

    return success(res, { payload: data, breakdown }, "Prepare payload successfully");
  } catch (e) {
    next(e);
  }
};
