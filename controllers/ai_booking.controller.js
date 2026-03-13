import * as service from "../services/ai_booking.service.js";
import { success, fail } from "../utils/response.js";

const handlePaginatedResponse = (res, result, message = "Success") => {
  if (result.error) return fail(res, result.error);
  return res.json({
    success: true,
    data: result.data,
    meta: result.meta,
    links: result.links,
    message,
  });
};

const handleStandardResponse = (res, result, message = "Success") => {
  if (result.error) return fail(res, result.error);
  return success(res, result.data, message);
};

export const getNowShowingMovies = async (req, res, next) => {
  try {
    const result = await service.aiGetNowShowingMovies(req.query);
    return handlePaginatedResponse(
      res,
      result,
      "Get now showing movies successfully",
    );
  } catch (e) {
    next(e);
  }
};

export const getComingSoonMovies = async (req, res, next) => {
  try {
    const result = await service.aiGetComingSoonMovies(req.query);
    return handlePaginatedResponse(
      res,
      result,
      "Get coming soon movies successfully",
    );
  } catch (e) {
    next(e);
  }
};

export const getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await service.aiGetMovieById(id);
    return handleStandardResponse(res, result, "Get movie successfully");
  } catch (e) {
    next(e);
  }
};

export const getMovieTypes = async (req, res, next) => {
  try {
    const result = await service.aiGetMovieTypes();
    return handleStandardResponse(res, result, "Get movie types successfully");
  } catch (e) {
    next(e);
  }
};

export const getShowTimes = async (req, res, next) => {
  try {
    const result = await service.aiGetShowTimes(req.query);
    return handlePaginatedResponse(res, result, "Get show times successfully");
  } catch (e) {
    next(e);
  }
};

export const getShowTimeSeats = async (req, res, next) => {
  try {
    const result = await service.aiGetShowTimeSeats(req.query);
    return handlePaginatedResponse(
      res,
      result,
      "Get show time seats successfully",
    );
  } catch (e) {
    next(e);
  }
};

export const getTicketPrices = async (req, res, next) => {
  try {
    const result = await service.aiGetTicketPrices(req.query);
    return handlePaginatedResponse(
      res,
      result,
      "Get ticket prices successfully",
    );
  } catch (e) {
    next(e);
  }
};

export const getFormats = async (req, res, next) => {
  try {
    const result = await service.aiGetFormats();
    return handleStandardResponse(res, result, "Get formats successfully");
  } catch (e) {
    next(e);
  }
};

export const getSeatTypes = async (req, res, next) => {
  try {
    const result = await service.aiGetSeatTypes();
    return handleStandardResponse(res, result, "Get seat types successfully");
  } catch (e) {
    next(e);
  }
};

export const getCombos = async (req, res, next) => {
  try {
    const result = await service.aiGetCombos(req.query);
    return handlePaginatedResponse(res, result, "Get combos successfully");
  } catch (e) {
    next(e);
  }
};

export const getComboDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await service.aiGetComboDetails(id);
    return handleStandardResponse(res, result, "Get combo successfully");
  } catch (e) {
    next(e);
  }
};

export const getMenuItems = async (req, res, next) => {
  try {
    const result = await service.aiGetMenuItems(req.query);
    return handlePaginatedResponse(res, result, "Get menu items successfully");
  } catch (e) {
    next(e);
  }
};

export const getMenuItemDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await service.aiGetMenuItemDetails(id);
    return handleStandardResponse(res, result, "Get menu item successfully");
  } catch (e) {
    next(e);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const result = await service.aiGetEvents(req.query);
    return handlePaginatedResponse(res, result, "Get events successfully");
  } catch (e) {
    next(e);
  }
};

export const getEventDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await service.aiGetEventDetails(id);
    return handleStandardResponse(res, result, "Get event successfully");
  } catch (e) {
    next(e);
  }
};

export const getEventTypes = async (req, res, next) => {
  try {
    const result = await service.aiGetEventTypes();
    return handleStandardResponse(res, result, "Get event types successfully");
  } catch (e) {
    next(e);
  }
};

export const getPaymentMethods = async (req, res, next) => {
  try {
    const result = service.aiGetPaymentMethods();
    return success(res, result, "Get payment methods successfully");
  } catch (e) {
    next(e);
  }
};

//
export const createBooking = async (req, res, next) => {
  try {
    const payload = req.body;
    // ensure user_id is set
    if (!payload.order) {
      payload.order = {};
    }
    if (!payload.order.user_id) {
      payload.order.user_id = req.user.id;
    }
    const { data, error } = await service.createOrder(payload);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Create booking successfully", 201);
  } catch (e) {
    next(e);
  }
};

export const bulkHoldSeats = async (req, res, next) => {
  const ttlSeconds = 600;
  try {
    const { userId, showTimeSeatIds } = req.body;
    const { data, error } = await service.aiBulkHoldSeats(
      showTimeSeatIds,
      userId,
      ttlSeconds,
    );
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Seats held successfully", 200);
  } catch (e) {
    next(e);
  }
};

export const cancelHoldSeats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { showTimeSeatIds } = req.body;
    const { data, error } = await service.aiCancelHoldSeats(
      showTimeSeatIds,
      userId,
    );
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Seat holds cancelled successfully", 200);
  } catch (e) {
    next(e);
  }
};

export const preparePayloadForCreate = async (req, res, next) => {
  try {
    const payload = req.body;
    const { data, error } = await service.preparePayloadForCreate(payload);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Payload prepared successfully", 200);
  } catch (e) {
    next(e);
  }
};

export const getAiBookingState = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await service.getAiBookingState(id);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Booking state retrieved successfully", 200);
  } catch (e) {
    next(e);
  }
};

export const getAiBookingStateDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await service.getAiBookingStateDetails(id);
    if (error) {
      return fail(res, error);
    }
    return success(
      res,
      data,
      "Booking state details retrieved successfully",
      200,
    );
  } catch (e) {
    next(e);
  }
};

export const saveAiBookingState = async (req, res, next) => {
  try {
    const { id, state } = req.body;
    const { data, error } = await service.saveAiBookingState(id, state);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Booking state saved successfully", 200);
  } catch (e) {
    next(e);
  }
};

export const clearAiBookingState = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await service.clearAiBookingState(id);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Booking state cleared successfully", 200);
  } catch (e) {
    next(e);
  }
};

export const chatWithAgent = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.body.user_id;
    const { message } = req.body;
    if (!message) {
      return fail(res, "Message is required");
    }
    const { data, error } = await service.chatWithAgent(userId, message);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Chat response received successfully", 200);
  } catch (e) {
    next(e);
  }
};
