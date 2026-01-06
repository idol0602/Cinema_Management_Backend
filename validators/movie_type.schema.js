import { z } from "zod";

export const createMovieTypeSchema = z.object({
  type: z.string().min(1),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateMovieTypeSchema = createMovieTypeSchema.partial();
