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
    return handlePaginatedResponse(res, result, "Get now showing movies successfully");
  } catch (e) {
    next(e);
  }
};

export const getComingSoonMovies = async (req, res, next) => {
  try {
    const result = await service.aiGetComingSoonMovies(req.query);
    return handlePaginatedResponse(res, result, "Get coming soon movies successfully");
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

export const getShowTimeSeatsByShowTimeId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await service.aiGetShowTimeSeatsByShowTimeId(id);
    return handleStandardResponse(res, result, "Get show time seats successfully");
  } catch (e) {
    next(e);
  }
};

export const getTicketPrices = async (req, res, next) => {
  try {
    const result = await service.aiGetTicketPrices(req.query);
    return handlePaginatedResponse(res, result, "Get ticket prices successfully");
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
