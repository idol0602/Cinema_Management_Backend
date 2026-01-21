import { z } from "zod";

export const createSeatSchema = z.object({
  room_id: z.string().min(1),
  seat_number: z
    .string()
    .min(1)
    .regex(/^[A-Za-z][0-9]+$/),
  type: z.string().min(1), // Reference to seat_types table
  is_active: z.boolean().default(true).optional(),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateSeatSchema = createSeatSchema.partial();
