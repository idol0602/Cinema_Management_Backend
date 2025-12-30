import { z } from "zod";

export const createComboItemSchema = z.object({
  combo_id: z.string().min(1),
  menu_item_id: z.string().min(1),
  quantity: z.number().int().min(1).default(1).optional(),
  unit_price: z.number(),
  is_active: z.boolean().default(true).optional(),
});

export const updateComboItemSchema = createComboItemSchema.partial();
