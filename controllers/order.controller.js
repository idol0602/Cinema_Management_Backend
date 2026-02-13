import * as service from "../services/order.service.js";
import { success, fail } from "../utils/response.js";
import { PAYMENT_STATUS } from "../utils/paymentStatus.js";

export const create = async (req, res, next) => {
  try {
    const { data, error } = await service.create(req.body);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Create order successfully", 201);
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
    return success(res, data, "Get orders successfully");
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
    return success(res, data, "Get order successfully");
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
    return success(res, data, "Update order successfully");
  } catch (e) {
    next(e);
  }
};

export const findAndPaginate = async (req, res, next) => {
  try {
    const result = await service.findAndPaginate(req.query);
    if (result.error) {
      return fail(res, result.error);
    }
    return res.json({
      success: true,
      data: result.data,
      meta: result.meta,
      links: result.links,
      message: "Get orders successfully",
    });
  } catch (e) {
    next(e);
  }
};

export const getOrderDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await service.getOrderDetails(id);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Get order details successfully");
  } catch (e) {
    next(e);
  }
};

export const handleOrderAndRelatedData = async (req, res, next) => {
  try {
    const payload = req.body;
    payload.order.payment_status = PAYMENT_STATUS.COMPLETED;
    const { data, error } = await service.handleOrderAndRelatedData(payload);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Process order successfully", 201);
  } catch (e) {
    next(e);
  }
};

export const getOrderHistory = async (req, res, next) => {
  try {
    const id = req.user.id
    const { data, error } = await service.getOrderHistory(id, req.query);
    if (error) {
      return fail(res, error);
    }
    return success(res, data, "Get order history successfully");
  } catch (e) {
    next(e);
  }
};