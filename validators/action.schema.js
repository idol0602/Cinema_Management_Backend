import { z } from "zod";

export const createActionSchema = z.object({
  name: z.string().min(2),
  path: z.string().min(1),
  method: z.enum(["GET", "POST", "PUT", "DELETE"]),
  is_active: z.boolean().default(true).optional(),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateActionSchema = createActionSchema.partial();
