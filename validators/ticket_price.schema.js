import { z } from "zod";

export const createTicketPriceSchema = z.object({
  format_id: z.string().min(1), // Reference to formats table
  seat_type_id: z.string().min(1), // Reference to seat_types table
  day_type: z.enum(["WEEKDAY", "WEEKEND"]),
  price: z.number(),
  is_active: z.boolean().default(true).optional(),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateTicketPriceSchema = createTicketPriceSchema.partial();
