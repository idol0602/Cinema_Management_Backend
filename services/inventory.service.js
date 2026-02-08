import * as menuItemRepo from "../repositories/menu_items.repo.js";
import * as comboRepo from "../repositories/combos.repo.js";
import { supabase } from "../config/supabase.js";
import { CACHE_PREFIX } from "../redis/cacheKeys.js";
import { Producer } from "../rabbitmq/producer.js";

const invalidateCache = () => {
  Producer.deleteCache(`${CACHE_PREFIX.MENU_ITEMS}:*`);
};


/**
 * Decrement stock for a single menu item
 * @param {string} itemId - Menu item ID
 * @param {number} quantity - Quantity to deduct
 * @returns {Promise<{data: any, error: any}>}
 */
export const decrementMenuItemStock = async (itemId, quantity) => {
  try {
    // Get current stock
    const { data: item, error: fetchError } = await supabase
      .from("menu_items")
      .select("num_instock")
      .eq("id", itemId)
      .single();

    if (fetchError) {
      return { data: null, error: fetchError };
    }

    const currentStock = item?.num_instock || 0;
    
    // Check if sufficient stock exists
    if (currentStock < quantity) {
      return { 
        data: null, 
        error: {
          message: `Insufficient stock for item ${itemId}. Requested: ${quantity}, Available: ${currentStock}`,
          code: 'INSUFFICIENT_STOCK',
          requested: quantity,
          available: currentStock
        }
      };
    }
    
    const newStock = currentStock - quantity;

    // Update stock
    const { data, error } = await supabase
      .from("menu_items")
      .update({ num_instock: newStock })
      .eq("id", itemId)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }
    invalidateCache();
    console.log(`📦 Inventory: Deducted ${quantity} from menu item ${itemId}. ${currentStock} -> ${newStock}`);
    return { data, error: null };
  } catch (error) {
    console.error("Error decrementing menu item stock:", error);
    return { data: null, error };
  }
};

/**
 * Deduct stock for all menu items in a combo
 * @param {string} comboId - Combo ID
 * @returns {Promise<{data: any, error: any}>}
 */
export const deductComboStock = async (comboId) => {
  try {
    // Get combo items with their menu_item_id and quantity
    const { data: comboItems, error: fetchError } = await supabase
      .from("combo_items")
      .select("menu_item_id, quantity")
      .eq("combo_id", comboId)
      .eq("is_active", true);

    if (fetchError) {
      return { data: null, error: fetchError };
    }

    if (!comboItems || comboItems.length === 0) {
      console.log(`📦 Combo ${comboId} has no active items`);
      return { data: [], error: null };
    }

    // Deduct stock for each menu item in the combo
    const results = [];
    for (const item of comboItems) {
      const result = await decrementMenuItemStock(item.menu_item_id, item.quantity);
      results.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        ...result
      });
    }

    console.log(`📦 Inventory: Deducted stock for combo ${comboId}`, results);
    return { data: results, error: null };
  } catch (error) {
    console.error("Error deducting combo stock:", error);
    return { data: null, error };
  }
};

/**
 * Validate if sufficient stock exists for menu items and combos
 * @param {Array} menuItems - Array of {item_id, quantity}
 * @param {Array} comboIds - Array of combo IDs
 * @returns {Promise<{valid: boolean, errors: Array}>}
 */
export const validateStock = async (menuItems = [], comboIds = []) => {
  const errors = [];

  // Check menu items stock
  for (const item of menuItems) {
    const { data, error } = await supabase
      .from("menu_items")
      .select("id, name, num_instock")
      .eq("id", item.item_id)
      .single();

    if (error) {
      errors.push({ item_id: item.item_id, error: "Item not found" });
      continue;
    }

    if ((data?.num_instock || 0) < item.quantity) {
      errors.push({
        item_id: item.item_id,
        name: data.name,
        requested: item.quantity,
        available: data.num_instock || 0,
        error: "Insufficient stock"
      });
    }
  }

  // Check combo items stock
  for (const comboId of comboIds) {
    const { data: comboItems, error } = await supabase
      .from("combo_items")
      .select(`
        menu_item_id,
        quantity,
        menu_items:menu_item_id (id, name, num_instock)
      `)
      .eq("combo_id", comboId)
      .eq("is_active", true);

    if (error) {
      errors.push({ combo_id: comboId, error: "Combo not found" });
      continue;
    }

    for (const item of comboItems || []) {
      const menuItem = item.menu_items;
      if ((menuItem?.num_instock || 0) < item.quantity) {
        errors.push({
          combo_id: comboId,
          item_id: item.menu_item_id,
          name: menuItem?.name,
          requested: item.quantity,
          available: menuItem?.num_instock || 0,
          error: "Insufficient stock in combo"
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Process inventory deduction for an order
 * @param {Array} menuItemInTickets - Array of {item_id, quantity}
 * @param {Array} comboItemInTickets - Array of {combo_id}
 * @returns {Promise<{success: boolean, results: any, error: any}>}
 */
export const processOrderInventory = async (menuItemInTickets = [], comboItemInTickets = []) => {
  const results = {
    menuItems: [],
    combos: []
  };

  try {
    // Deduct stock for direct menu items
    for (const item of menuItemInTickets) {
      const result = await decrementMenuItemStock(item.item_id, item.quantity);
      results.menuItems.push({
        item_id: item.item_id,
        quantity: item.quantity,
        success: !result.error,
        error: result.error
      });
    }

    // Deduct stock for combos
    for (const combo of comboItemInTickets) {
      const result = await deductComboStock(combo.combo_id);
      results.combos.push({
        combo_id: combo.combo_id,
        success: !result.error,
        items: result.data,
        error: result.error
      });
    }

    // Check if any item failed
    const hasMenuItemErrors = results.menuItems.some(item => !item.success);
    const hasComboErrors = results.combos.some(combo => !combo.success);
    const hasErrors = hasMenuItemErrors || hasComboErrors;

    if (hasErrors) {
      console.log("📦 Order inventory failed - insufficient stock:", results);
      return { 
        success: false, 
        results, 
        error: {
          message: "Insufficient stock for one or more items",
          code: 'INSUFFICIENT_STOCK'
        }
      };
    }

    console.log("📦 Order inventory processed successfully:", results);
    return { success: true, results, error: null };
  } catch (error) {
    console.error("Error processing order inventory:", error);
    return { success: false, results, error };
  }
};

/**
 * Validate booking time - check if showtime hasn't passed
 * @param {string} startTime - Showtime start time (ISO string)
 * @param {number} cutoffMinutes - Minutes before showtime to cutoff booking (default: 5)
 * @returns {{valid: boolean, message: string, remainingMinutes: number}}
 */
export const validateBookingTime = (startTime, cutoffMinutes = 5) => {
  const showStart = new Date(startTime);
  const now = new Date();
  const cutoffTime = new Date(showStart.getTime() - cutoffMinutes * 60 * 1000);
  
  const remainingMs = cutoffTime.getTime() - now.getTime();
  const remainingMinutes = Math.floor(remainingMs / (60 * 1000));

  if (now >= cutoffTime) {
    return {
      valid: false,
      message: `Đã quá thời gian đặt vé. Chỉ có thể đặt vé trước ${cutoffMinutes} phút so với giờ chiếu.`,
      remainingMinutes: 0
    };
  }

  return {
    valid: true,
    message: `Còn ${remainingMinutes} phút để hoàn tất đặt vé`,
    remainingMinutes
  };
};
