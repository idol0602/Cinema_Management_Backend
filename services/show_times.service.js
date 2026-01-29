import { v4 as uuidv4 } from "uuid";
import * as repo from "../repositories/show_times.repo.js";
import * as seatRepo from "../repositories/seat.repo.js";
import * as showTimeSeatRepo from "../repositories/show_time_seats.repo.js";
import { SEAT_STATUS } from "../utils/seatStatus.js";

export const create = (payload) => repo.create({ id: uuidv4(), ...payload });
export const findAll = () => repo.findAll();
export const findById = (id) => repo.findById(id);
export const update = (id, data) => repo.update(id, data);
export const remove = (id) => repo.remove(id);
export const findAndPaginate = (query) => repo.findAndPaginate(query);
export const findByRoomId = (roomId) => repo.findByRoomId(roomId);
export const findByRoomIdsAndDates = (roomIds, startDate, endDate) =>
  repo.findByRoomIdsAndDates(roomIds, startDate, endDate);
export const bulkCreate = async (showTimes) => {
  try {
    const roomIds = [...new Set(showTimes.map(st => st.room_id))];
    const seatsByRoom = {};

    await Promise.all(
      roomIds.map(async (roomId) => {
        const seats = await seatRepo.getSeatByRoomId(roomId);
        seatsByRoom[roomId] = seats.data;
      })
    );
    const showTimeSeats = [];
    const showTimeWithId = showTimes.map((showTime) => {
      const id = uuidv4();
      const seats = seatsByRoom[showTime.room_id] || [];

      seats.forEach((seat) => {
        showTimeSeats.push({
          id: uuidv4(),
          show_time_id: id,
          seat_id: seat.id,
          status_seat: seat.is_active ? SEAT_STATUS.AVAILABLE : SEAT_STATUS.FIXING,
        })
      })
      return {
        id,
        ...showTime,
      };
    })

    const {data, error} = await repo.bulkCreate(showTimeWithId);
    if (error) {
      return { data: null, error };
    }
   
    if(showTimeSeats.length > 0) {
      const seatResult = await showTimeSeatRepo.bulkCreate(showTimeSeats);
      if (seatResult.error) {
        return { data: null, error: seatResult.error };
      }
    }
    return { data, error: null };
  } catch (error) {
    console.error("bulkCreate error:", error);
    return { data: null, error: error.message };
  }
};
export const getShowTimeDetails = (showTimeId) => repo.getShowTimeDetails(showTimeId);

