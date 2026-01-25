import { z } from "zod";

import {createComboItemSchema} from "./combo_items.schema.js"
import {createComboMovieSchema} from "./combo_movies.schema.js"
import {createComboEventSchema} from "./combos_events.schema.js"

export const createComboSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  total_price: z.number(),
  is_active: z.boolean().default(true).optional(),
  created_at: z.string().default(new Date().toISOString()).optional(),
});

export const createComboAndRelationSchema = z.object({
  combo: createComboSchema,
  comboItems: z.array(createComboItemSchema).default([]).optional(),
  comboMovie: createComboMovieSchema.default({}).optional(),
  comboEvent: createComboEventSchema.default({}).optional(),
});

export const updateComboSchema = createComboSchema.partial();
