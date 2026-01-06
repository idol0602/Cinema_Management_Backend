import { z } from "zod";

export const createComboItemInTicketSchema = z.object({
  order_id: z.string().min(1),
  combo_id: z.string().min(1),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateComboItemInTicketSchema =
  createComboItemInTicketSchema.partial();
