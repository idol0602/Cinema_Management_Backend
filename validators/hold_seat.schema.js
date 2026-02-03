import { z } from "zod";

export const holdSeatSchema = z.object({
  ttlSeconds: z.number().int().min(60).max(3600).optional().default(600),
});

export const bulkHoldSeatsSchema = z.object({
  showTimeSeatIds: z.array(z.string().min(1)).min(1).max(20),
  ttlSeconds: z.number().int().min(60).max(3600).optional().default(600),
});

export const bulkCancelHoldSeatsSchema = z.object({
  showTimeSeatIds: z.array(z.string().min(1)).min(1).max(20),
});
