import { z } from "zod";

export const createEventTypeSchema = z.object({
  name: z.string().min(2),
  is_active: z.boolean().default(true).optional(),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateEventTypeSchema = createEventTypeSchema.partial();
