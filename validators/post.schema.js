import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  image: z.string().optional(),
  user_id: z.string().min(1),
  created_at: z.string().default(new Date(Date.now()).toISOString()).optional(),
  is_active: z.boolean().default(true).optional(),
});

export const updatePostSchema = createPostSchema.partial();
