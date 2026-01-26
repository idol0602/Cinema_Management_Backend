import { z } from "zod";

export const createComboMovieSchema = z.object({
  combo_id: z.string().optional(),
  movie_id: z.string().optional(),
});

export const updateComboMovieSchema = createComboMovieSchema.partial();
