import { z } from "zod";
import { createTicketSchema } from "./ticket.schema.js";
import { createComboItemInTicketSchema } from "./combo_item_in_tickets.schema.js";
import { createMenuItemInTicketSchema } from "./menu_item_in_tickets.schema.js";
import { createShowTimeSchema } from "./show_times.schema.js";

export const createOrderSchema = z.object({
  discount_id: z.string().nullable().optional(),
  user_id: z.string().min(1),
  trans_id: z.string().nullable().optional(),
  movie_id: z.string().min(1),
  service_vat: z.number().default(0).optional(),
  payment_status: z
    .enum(["PENDING", "COMPLETED", "FAILED", "CANCELED", "REFUND_PENDING", "REFUNDED"])
    .default("PENDING")
    .optional(),
  payment_method: z.string().optional(),
  total_price: z.number(),
  created_at: z.string().default(new Date().toISOString()).optional(),
  requested_at: z.string().default(new Date().toISOString()).optional(),
});

export const updateOrderSchema = createOrderSchema.partial();

// Schema for processing order with tickets, combos, menu items
export const processOrderSchema = z.object({
  order: createOrderSchema.partial().extend({
    id: z.string().min(1), // order id is required
  }),
  tickets: z.array(createTicketSchema.omit({ order_id: true, qr_code: true, checked_in: true })),
  comboItemInTickets: z.array(createComboItemInTicketSchema.omit({ order_id: true })),
  menuItemInTickets: z.array(createMenuItemInTicketSchema.omit({ order_id: true })),
  showTime: createShowTimeSchema.partial(),
});
