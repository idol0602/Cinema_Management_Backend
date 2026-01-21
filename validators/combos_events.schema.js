import { z } from "zod";

export const createComboEventSchema = z.object({
  combo_id: z.string().min(1),
  event_id: z.string().min(1),
});

export const updateComboEventSchema = createComboEventSchema.partial();
