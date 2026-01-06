import { z } from "zod";
// NEED TO REVIEW
export const createShowTimeSchema = z.object({
  movie_id: z.string().min(1),
  room_id: z.string().min(1),
  start_time: z.string().min(1),
  end_time: z.string().optional(),
  day_type: z.enum(["WEEKDAY", "WEEKEND"]),
  is_active: z.boolean().default(true).optional(),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateShowTimeSchema = createShowTimeSchema.partial();
