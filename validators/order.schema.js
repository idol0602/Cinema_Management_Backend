import { z } from "zod";
import { createTicketSchema } from "./ticket.schema.js";
import { createComboItemInTicketSchema } from "./combo_item_in_tickets.schema.js";
import { createMenuItemInTicketSchema } from "./menu_item_in_tickets.schema.js";
import { createShowTimeSchema } from "./show_times.schema.js";
import { PAYMENT_METHODS } from "../utils/paymentMethods.js";

const paymentMethodValues = Object.values(PAYMENT_METHODS);

export const createOrderSchema = z.object({
  discount_id: z.string().nullable().optional(),
  user_id: z.string().min(1),
  trans_id: z.string().nullable().optional(),
  movie_id: z.string().min(1),
  service_vat: z.number().default(0).optional(),
  payment_status: z
    .enum([
      "PENDING",
      "COMPLETED",
      "FAILED",
      "CANCELED",
      "REFUND_PENDING",
      "REFUNDED",
    ])
    .default("PENDING")
    .optional(),
  payment_method: z.string().optional(),
  total_price: z.number(),
  created_at: z.string().default(new Date().toISOString()).optional(),
  requested_at: z.string().optional(),
});

export const updateOrderSchema = createOrderSchema.partial();

// Schema for processing order with tickets, combos, menu items
export const processOrderSchema = z.object({
  order: createOrderSchema.partial().extend({
    id: z.string().min(1), // order id is required
  }),
  tickets: z.array(
    createTicketSchema.omit({
      order_id: true,
      qr_code: true,
      checked_in: true,
    }),
  ),
  comboItemInTickets: z.array(
    createComboItemInTicketSchema.omit({ order_id: true }),
  ),
  menuItemInTickets: z.array(
    createMenuItemInTicketSchema.omit({ order_id: true }),
  ),
  showTime: createShowTimeSchema.partial(),
});

// Schema for creating order with tickets, combos, menu items (new order - no order.id needed)
export const createOrderWithRelatedDataSchema = z.object({
  order: createOrderSchema,
  tickets: z
    .array(
      createTicketSchema.omit({
        order_id: true,
        qr_code: true,
        checked_in: true,
      }),
    )
    .default([]),
  comboItemInTickets: z
    .array(createComboItemInTicketSchema.omit({ order_id: true }))
    .default([]),
  menuItemInTickets: z
    .array(createMenuItemInTicketSchema.omit({ order_id: true }))
    .default([]),
  showTime: createShowTimeSchema.partial().optional(),
});

export const createPaymentUrlSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number(),
  paymentMethod: z
    .enum(paymentMethodValues)
    .optional()
    .default(PAYMENT_METHODS.CASH),
});
