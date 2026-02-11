import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  // role: z.string().optional(),
  // is_online: z.boolean().default(false).optional(),
  // last_seen: z.string().default(new Date().toISOString()).optional(),
  // created_at: z.string().default(new Date().toISOString()).optional(),
  // is_active: z.boolean().default(true).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(6),
});
