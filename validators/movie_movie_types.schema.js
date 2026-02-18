import { z } from "zod";

export const createMovieMovieTypeSchema = z.object({
  movie_id: z.string().min(1),
  movie_type_id: z.string().min(1),
});

export const updateMovieMovieTypeSchema = createMovieMovieTypeSchema.partial();
