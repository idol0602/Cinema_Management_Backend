import { z } from "zod";

const eventBaseSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  image: z.string().optional(),
  is_in_combo: z.boolean().default(false).optional(),
  event_type_id: z.string().min(1), // Reference to event_types table
  only_at_counter: z.boolean().default(false).optional(),
  is_active: z.boolean().default(true).optional(),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

const withDateRangeRefine = (schema) =>
  schema.superRefine((data, ctx) => {
    if (data?.start_date && data?.end_date) {
      const from = new Date(String(data.start_date));
      const to = new Date(String(data.end_date));

      if (from >= to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start date must be earlier than end date",
          path: ["end_date"],
        });
      }
    }
  });

export const createEventSchema = withDateRangeRefine(eventBaseSchema);
export const updateEventSchema = withDateRangeRefine(eventBaseSchema.partial());
