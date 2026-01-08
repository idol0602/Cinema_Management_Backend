import { z } from "zod";

export const createRateSchema = z.object({
  movie_id: z.string().min(1),
  user_id: z.string().min(1),
  stars: z.number().min(1).max(10),
  created_at: z.string().default(new Date(Date.now()).toISOString()).optional(),
});

export const updateRateSchema = createRateSchema.partial();
