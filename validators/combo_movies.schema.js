import { z } from "zod";

export const createComboMovieSchema = z.object({
  combo_id: z.string().optional(), // Generated in backend
  movie_id: z.string().optional(), // Optional - user may not select a movie
});

export const updateComboMovieSchema = createComboMovieSchema.partial();
