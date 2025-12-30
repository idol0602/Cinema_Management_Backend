import { z } from "zod";

export const createCommentSchema = z.object({
  movie_id: z.string().min(1),
  user_id: z.string().min(1),
  content: z.string().min(1),
  created_at: z.string().default(new Date(Date.now()).toISOString()).optional(),
  is_active: z.boolean().default(true).optional(),
});

export const updateCommentSchema = createCommentSchema.partial();
