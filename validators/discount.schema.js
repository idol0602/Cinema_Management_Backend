import { z } from "zod";

export const createDiscountSchema = z
  .object({
    event_id: z.string().optional(),
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    discount_percent: z.number().optional(),
    valid_from: z
      .string()
      .default(new Date(Date.now()).toISOString())
      .optional(),
    valid_to: z
      .string()
      .default(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
      .optional(),
    is_active: z.boolean().default(true).optional(),
    created_at: z.string().default(new Date().toISOString()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.valid_from && data.valid_to) {
      const from = new Date(data.valid_from);
      const to = new Date(data.valid_to);
      if (from >= to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "'valid_from' must be earlier than 'valid_to'",
        });
      }
    }
  });

export const updateDiscountSchema = createDiscountSchema.partial();
