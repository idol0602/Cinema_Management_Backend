import { v4 as uuidv4 } from "uuid";
import * as repo from "../repositories/show_time_seats.repo.js";

export const create = (payload) => repo.create({ id: uuidv4(), ...payload });
export const findAll = () => repo.findAll();
export const findById = (id) => repo.findById(id);
export const update = (id, data) => repo.update(id, data);
export const remove = (id) => repo.remove(id);
export const statusSeat = (id) => repo.getStatus(id);
export const findAndPaginate = (query) => repo.findAndPaginate(query);
export const bulkCreate = (payload) => repo.bulkCreate(payload);
export const findByShowTimeId = (showTimeId) =>
  repo.findByShowTimeId(showTimeId);
export const holdSeat = (showTimeSeatId, userId, ttlSeconds) =>
  repo.holdSeat(showTimeSeatId, userId, ttlSeconds);
export const cancelHoldSeat = (showTimeSeatId, userId) =>
  repo.cancelHoldSeat(showTimeSeatId, userId);
export const getHoldInfo = (showTimeSeatId, userId) =>
  repo.getHoldInfo(showTimeSeatId, userId);
export const getAllHeldSeatsByUserId = (userId) =>
  repo.getAllHeldSeatsByUserId(userId);
export const bulkHoldSeats = (showTimeSeatIds, userId, ttlSeconds) =>
  repo.bulkHoldSeats(showTimeSeatIds, userId, ttlSeconds);
export const bulkCancelHoldSeats = (showTimeSeatIds, userId) =>
  repo.bulkCancelHoldSeats(showTimeSeatIds, userId);
