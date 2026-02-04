import * as repo from "../repositories/order.repo.js";
import { v4 as uuidv4 } from "uuid";
import { PAYMENT_STATUS } from "../utils/paymentStatus.js";

export const create = (order) => {
  const movieWithId = {
    ...order,
    id: uuidv4(),
    payment_status: PAYMENT_STATUS.PENDING,
  };
  return repo.create(movieWithId);
};

export const findAll = () => repo.findAll();
export const findById = (id) => repo.findById(id);
export const update = (id, data) => repo.update(id, data);
export const findAndPaginate = (query) => repo.findAndPaginate(query);
export const getOrderDetails = (orderId) => repo.getOrderDetails(orderId);
