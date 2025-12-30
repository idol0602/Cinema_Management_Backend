import { z } from "zod";

export const createShowTimeSeatSchema = z.object({
  show_time_id: z.string().min(1),
  seat_id: z.string().min(1),
  status_seat: z.enum(["AVAILABLE", "HOLDING", "BOOKED", "FIXING"]).default("AVAILABLE").optional(),
});

export const updateShowTimeSeatSchema = createShowTimeSeatSchema.partial();
