import { z } from "zod";

export const createComboEventSchema = z.object({
  combo_id: z.string().min(1),
  event_id: z.string().min(1),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateComboEventSchema = createComboEventSchema.partial();
