import { z } from "zod";

export const createSlideSchema = z.object({
  image: z.string().min(1),
  trailer: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  is_active: z.boolean().default(true).optional(),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateSlideSchema = createSlideSchema.partial();
