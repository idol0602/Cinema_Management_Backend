import { z } from "zod";

export const seatTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const seatSchema = z.object({
  id: z.string(),
  seat_number: z.string(),
  type: z.string(),
  room_id: z.string(),
  seat_types: seatTypeSchema.nullable().optional(),
});

export const createShowTimeSeatSchema = z.object({
  show_time_id: z.string().min(1),
  seat_id: z.string().min(1),
  status_seat: z
    .enum(["AVAILABLE", "HOLDING", "BOOKED", "FIXING"])
    .default("AVAILABLE")
    .optional(),
});

export const updateShowTimeSeatSchema = createShowTimeSeatSchema.partial();

export const showTimeSeatResponseSchema = z.object({
  id: z.string(),
  show_time_id: z.string(),
  seat_id: z.string(),
  status_seat: z.enum(["AVAILABLE", "HOLDING", "BOOKED", "FIXING"]),
  seats: seatSchema.nullable().optional(),
});
