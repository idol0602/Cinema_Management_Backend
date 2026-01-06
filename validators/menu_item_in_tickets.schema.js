import { z } from "zod";

export const createMenuItemInTicketSchema = z.object({
  order_id: z.string().min(1),
  item_id: z.string().min(1),
  quantity: z.number().int().min(1),
  unit_price: z.number().gt(0),
  total_price: z.number().optional(),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateMenuItemInTicketSchema =
  createMenuItemInTicketSchema.partial();
