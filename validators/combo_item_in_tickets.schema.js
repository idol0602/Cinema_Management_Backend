import { z } from "zod";

export const createComboItemInTicketSchema = z.object({
  ticket_id: z.string().min(1),
  combo_id: z.string().min(1),
});

export const updateComboItemInTicketSchema = createComboItemInTicketSchema.partial();
