import { z } from "zod";

export const createOrderSchema = z.object({
  discount_id: z.string().optional(),
  user_id: z.string().min(1),
  service_vat: z.number().default(10).optional(),
  total_price: z.number(),
  purchased_at: z
    .string()
    .default(new Date(Date.now()).toISOString())
    .optional(),
});

export const updateOrderSchema = createOrderSchema.partial();
