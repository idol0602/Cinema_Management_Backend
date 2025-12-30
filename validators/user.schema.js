import z from "zod"

export const createUserSchema = z.object({
    name: z.string().min(4),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(6),
    role: z.enum(["CUSTOMER", "STAFF", "ADMIN"]).default("CUSTOMER"),
    points: z.number().int().default(0).optional(),
    is_active: z.boolean().default(true).optional(),
    created_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateUserSchema = createUserSchema.partial();