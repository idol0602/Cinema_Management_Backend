import { v4 as uuidv4 } from "uuid";
import * as repo from "../repositories/combos.repo.js";

export const create = (payload) => {
  const { combo, comboItems = [], comboMovie = {}, comboEvent = {} } = payload;

  const p_combo = {
    id: uuidv4(),
    name: combo.name,
    description: combo.description,
    total_price: combo.total_price,
    is_active: combo.is_active ?? true,
    created_at: new Date().toISOString(),
  };

  // Map combo items - only if array has items
  const p_combo_items = comboItems.map((item) => ({
    id: uuidv4(),
    combo_id: p_combo.id,
    menu_item_id: item.menu_item_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    is_active: item.is_active ?? true,
  }));

  // Build combo_movie object - empty if no movie_id
  const p_combo_movie = comboMovie?.movie_id
    ? {
        id: uuidv4(),
        combo_id: p_combo.id,
        movie_id: comboMovie.movie_id,
      }
    : {};

  // Build combo_event object - empty if no event_id
  const p_combo_event = comboEvent?.event_id
    ? {
        id: uuidv4(),
        combo_id: p_combo.id,
        event_id: comboEvent.event_id,
      }
    : {};

  return repo.create({ p_combo, p_combo_items, p_combo_movie, p_combo_event });
};

export const update = async (id, payload) => {
  // Check if payload has the new structure with combo object
  // or if it's a simple update (backward compatibility)
  if (!payload.combo) {
    // Simple update - just update the combo directly
    return repo.update(id, payload);
  }

  const { combo, comboItems = [], comboMovie = {}, comboEvent = {} } = payload;

  // Prepare combo update data
  const p_combo = {
    name: combo.name,
    description: combo.description,
    total_price: combo.total_price,
    is_active: combo.is_active ?? true,
  };

  // Map combo items with new IDs
  const p_combo_items = comboItems.map((item) => ({
    id: uuidv4(),
    combo_id: id,
    menu_item_id: item.menu_item_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    is_active: item.is_active ?? true,
  }));

  // Build combo_movie object
  const p_combo_movie = comboMovie?.movie_id
    ? {
        id: uuidv4(),
        combo_id: id,
        movie_id: comboMovie.movie_id,
      }
    : {};

  // Build combo_event object
  const p_combo_event = comboEvent?.event_id
    ? {
        id: uuidv4(),
        combo_id: id,
        event_id: comboEvent.event_id,
      }
    : {};

  console.log("Calling updateWithDetails with:", {
    id,
    p_combo,
    p_combo_items,
    p_combo_movie,
    p_combo_event,
  });

  const result = await repo.updateWithDetails(id, {
    p_combo,
    p_combo_items,
    p_combo_movie,
    p_combo_event,
  });

  console.log("updateWithDetails result:", JSON.stringify(result, null, 2));

  // RPC returns data in result.data, check if it has success: false
  if (result.error) {
    return { data: null, error: result.error };
  }

  // Check if the RPC returned an error in the data
  if (result.data && result.data.success === false) {
    return { data: null, error: result.data.error || "Update failed" };
  }
  return { data: result.data, error: null };
};

export const findAll = () => repo.findAll();
export const findById = (id) => repo.findById(id);
export const remove = (id) => repo.remove(id);
export const findAndPaginate = (query) => repo.findAndPaginate(query);
