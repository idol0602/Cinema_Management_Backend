import z from "zod";

export const chatWithAgentSchema = z.object({
  question: z.string().min(1),
  session_id: z.string().min(1),
});
