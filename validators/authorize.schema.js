import { z } from "zod";

export const createAuthorizeSchema = z.object({
  role_id: z.string().min(1),
  action_id: z.string().min(1),
});

export const updateAuthorizeSchema = createAuthorizeSchema.partial();
