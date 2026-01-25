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
export const findAll = () => repo.findAll();
export const findById = (id) => repo.findById(id);
export const update = (id, data) => repo.update(id, data);
export const remove = (id) => repo.remove(id);
export const findAndPaginate = (query) => repo.findAndPaginate(query);
