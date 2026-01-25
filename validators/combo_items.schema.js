import { z } from "zod";

export const createComboItemSchema = z.object({
  combo_id: z.string().optional(), // Generated in backend
  menu_item_id: z.string().min(1),
  quantity: z.number().int().min(1),
  unit_price: z.number().gt(0),
  is_active: z.boolean().default(true).optional(),
});

export const updateComboItemSchema = createComboItemSchema.partial();
