import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(["CUSTOMER", "STAFF", "ADMIN"]).default("CUSTOMER"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
