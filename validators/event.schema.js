import { z } from "zod";

export const createEventSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  start_date: z.string().optional().default(new Date(Date.now()).toISOString()),
  end_date: z
    .string()
    .optional()
    .default(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),
  image: z.string().optional(),
  is_active: z.boolean().default(true).optional(),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateEventSchema = createEventSchema.partial();
