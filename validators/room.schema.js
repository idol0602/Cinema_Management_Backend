import { z } from "zod";

export const createRoomSchema = z.object({
  name: z.string().min(1),
  format: z.enum(["2D", "3D", "IMAX"]),
  location: z.string().optional(),
  is_active: z.boolean().default(true).optional(),
});

export const updateRoomSchema = createRoomSchema.partial();
