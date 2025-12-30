import { z } from "zod";

export const createMovieTypeSchema = z.object({
  type: z.string().min(1),
});

export const updateMovieTypeSchema = createMovieTypeSchema.partial();
