import { z } from "zod";

export const createMovieSchema = z.object({
  title: z.string(),
  director: z.string(),
  description: z.string().optional(),
  release_date: z.string().optional(),
  duration: z.number().int().optional(),
  image: z.string().optional(),
  thumbnail: z.string().optional(),
  trailer: z.string().optional(),
  movie_type_id: z.string(),
});

export const updateMovieSchema = createMovieSchema.partial();
