import { z } from "zod";

export const createComboMovieSchema = z.object({
  combo_id: z.string().min(1),
  movie_id: z.string().min(1),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateComboMovieSchema = createComboMovieSchema.partial();
