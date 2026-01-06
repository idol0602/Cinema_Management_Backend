import { z } from "zod";

export const createMenuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().gt(0),
  item_type: z.enum(["FOOD", "DRINK", "GIFT"]),
  image: z.string().optional(),
  num_instock: z.number().int().default(0).optional(),
  is_active: z.boolean().default(true).optional(),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();
