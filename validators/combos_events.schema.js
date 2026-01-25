import { z } from "zod";

export const createComboEventSchema = z.object({
  combo_id: z.string().optional(), // Generated in backend
  event_id: z.string().optional(), // Optional - user may not select an event
});

export const updateComboEventSchema = createComboEventSchema.partial();
