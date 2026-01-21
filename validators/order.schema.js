import { z } from "zod";

export const createOrderSchema = z.object({
  discount_id: z.string().optional(),
  user_id: z.string().min(1),
  service_vat: z.number().default(0).optional(),
  payment_status: z
    .enum(["PENDING", "COMPLETED", "FAILED", "CANCELED"])
    .default("PENDING")
    .optional(),
  payment_method: z.string().optional(),
  total_price: z.number(),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateOrderSchema = createOrderSchema.partial();
