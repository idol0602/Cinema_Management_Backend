import { z } from "zod";

export const chatWithBotSchema = z.object({
  user_id: z.string().min(1),
  message: z.string().min(1),
});
