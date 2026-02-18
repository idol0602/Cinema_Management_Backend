import { z } from "zod";

export const createMovieSchema = z.object({
  title: z.string(),
  director: z.string(),
  country: z.string(),
  description: z.string(),
  release_date: z
    .string()
    .default(new Date(Date.now()).toISOString())
    .optional(),
  duration: z.number().int().gt(45).default(120).optional(),
  rating: z.number().min(0).max(10).default(0).optional(),
  image: z.string().optional(),
  thumbnail: z.string().optional(),
  trailer: z.string().optional(),
  is_active: z.boolean().default(true).optional(),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateMovieSchema = createMovieSchema.partial();

export const createMovieWithTypesSchema = z.object({
  movie: createMovieSchema,
  movieTypes: z.array(z.string()).min(1).default([]),
});

export const updateMovieWithTypesSchema = z.object({
  movie: updateMovieSchema,
  movieTypes: z.array(z.string()).default([]),
});
