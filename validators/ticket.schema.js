import { z } from "zod";

export const createTicketSchema = z.object({
  ticket_price_id: z.string().min(1),
  order_id: z.string().min(1),
  showtime_seat_id: z.string().min(1),
  checked_in: z.boolean().default(false).optional(),
  qr_code: z.string().optional(),
});

export const updateTicketSchema = createTicketSchema.partial();
