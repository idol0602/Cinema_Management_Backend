import { z } from "zod";

export const chatWithAgentSchema = z.object({
  message: z.string().min(1),
  user_id: z.string().min(1),
});