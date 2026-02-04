import * as service from "../services/show_time_seats.service.js";
import { success, fail } from "../utils/response.js";

export const create = async (req, res, next) => {
  try {
    const { data, error } = await service.create(req.body);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Create show time seat successfully", 201);
  } catch (e) {
    next(e);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { data, error } = await service.findAll();
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Get show time seats successfully");
  } catch (e) {
    next(e);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await service.findById(id);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Get show time seat successfully");
  } catch (e) {
    next(e);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await service.update(id, req.body);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Update show time seat successfully");
  } catch (e) {
    next(e);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await service.remove(id);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Remove show time seat successfully");
  } catch (e) {
    next(e);
  }
};

export const getStatusSeat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await service.statusSeat(id);
    if (error) throw error;
    return success(res, data, "Get status seat successfully");
  } catch (e) {
    next(e);
  }
};

export const findAndPaginate = async (req, res, next) => {
  try {
    const { data, error } = await service.findAndPaginate(req.query);
    if (error) {
      return fail(res, error);
    }
    return success(
      res,
      data,
      "Get show time seats with pagination successfully",
    );
  } catch (e) {
    next(e);
  }
};

export const holdSeat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { ttlSeconds } = req.body;

    const { data, error } = await service.holdSeat(id, userId, ttlSeconds);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Seat held successfully", 200);
  } catch (e) {
    next(e);
  }
};

export const cancelHoldSeat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data, error } = await service.cancelHoldSeat(id, userId);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Seat hold cancelled successfully", 200);
  } catch (e) {
    next(e);
  }
};

export const getHoldInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    console.log(userId);
    const { data, error } = await service.getHoldInfo(id, userId || 1);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Hold info retrieved successfully", 200);
  } catch (e) {
    next(e);
  }
};

export const getAllHeldSeats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { data, error } = await service.getAllHeldSeatsByUserId(userId);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "All held seats retrieved successfully", 200);
  } catch (e) {
    next(e);
  }
};

export const bulkHoldSeats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { showTimeSeatIds, ttlSeconds } = req.body;

    const { data, error } = await service.bulkHoldSeats(
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

export const bulkCancelHoldSeats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { showTimeSeatIds } = req.body;

    const { data, error } = await service.bulkCancelHoldSeats(
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
