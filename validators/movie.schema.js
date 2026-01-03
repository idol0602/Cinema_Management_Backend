import { z } from "zod";

export const createMovieSchema = z.object({
  title: z.string(),
  director: z.string(),
  description: z.string().optional(),
  release_date: z
    .string()
    .default(new Date(Date.now()).toISOString())
    .optional(),
  duration: z.number().int().gt(45).optional(),
  rating: z.number().min(0).max(10).default(0).optional(),
  image: z.string().optional(),
  thumbnail: z.string().optional(),
  trailer: z.string().optional(),
  movie_type_id: z.string(),
  is_active: z.boolean().default(true).optional(),
});

export const updateMovieSchema = createMovieSchema.partial();
