import { z } from "zod";
import { PAYMENT_METHODS } from "../utils/paymentMethods.js";

const paymentMethodValues = Object.values(PAYMENT_METHODS);

export const preparePayloadForCreateSchema = z.object({
  movieId: z.string().min(1, "movieId is required"),
  showTimeId: z.string().min(1, "showTimeId is required"),
  showTimeSeatIds: z
    .array(z.string().min(1))
    .min(1, "At least one showTimeSeatId is required"),
  comboIds: z.array(z.string().min(1)).default([]),
  menuItems: z
    .array(
      z.object({
        menuItemId: z.string().min(1, "menuItemId is required"),
        quantity: z.number().int().min(1, "quantity must be at least 1"),
      }),
    )
    .default([]),
  paymentMethod: z
    .enum(paymentMethodValues)
    .optional()
    .default(PAYMENT_METHODS.CASH),
  eventId: z.string().nullable().optional(),
});
