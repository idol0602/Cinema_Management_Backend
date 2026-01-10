import { v4 as uuidv4 } from "uuid";
import * as repo from "../repositories/seat.repo.js";
import xlsx from "xlsx";

export const create = (payload) => repo.create({ id: uuidv4(), ...payload });
export const findAll = () => repo.findAll();
export const findById = (id) => repo.findById(id);
export const update = (id, data) => repo.update(id, data);
export const remove = (id) => repo.remove(id);
export const getSeatByRoomId = (roomId) => repo.getSeatByRoomId(roomId);
export const findAndPaginate = (query) => repo.findAndPaginate(query);

export const importFromExcel = async (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data = xlsx.utils.sheet_to_json(worksheet);

    const seats = data.map((row) => ({
      id: uuidv4(),
      room_id: row.room_id || row.RoomId,
      seat_number: row.seat_number || row.SeatNumber,
      type: row.type || row.Type || "STANDARD",
      is_active: row.is_active !== undefined ? row.is_active : true,
      created_at: new Date().toISOString(),
    }));

    // Lọc bỏ các dòng không hợp lệ (thiếu room_id, seat_number)
    const validSeats = seats.filter((seat) => seat.room_id && seat.seat_number);

    if (validSeats.length === 0) {
      return {
        error: new Error("No valid seats found in the Excel file"),
      };
    }

    // Insert bulk vào database
    const result = await repo.bulkCreate(validSeats);

    return {
      data: result.data,
      error: result.error,
      imported: validSeats.length,
      skipped: data.length - validSeats.length,
    };
  } catch (error) {
    return {
      error: error,
      imported: 0,
      skipped: 0,
    };
  }
};
