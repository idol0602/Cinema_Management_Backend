import * as repo from "../repositories/prepare_payload.repo.js";

export const preparePayloadForCreate = async ({
  userId,
  movieId,
  showTimeId,
  showTimeSeatIds,
  comboIds = [],
  menuItems = [],
  paymentMethod = "CASH",
  eventId = null,
}) => {
  try {
    const { data, error } = await repo.preparePayloadForCreate({
      p_user_id: userId,
      p_movie_id: movieId,
      p_show_time_id: showTimeId,
      p_show_time_seat_ids: showTimeSeatIds,
      p_combo_ids: comboIds,
      p_menu_items: menuItems.map((item) => ({
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
      })),
      p_payment_method: paymentMethod,
      p_event_id: eventId,
    });

    if (error) {
      console.error("❌ preparePayloadForCreate RPC error:", error);
      return { data: null, error };
    }

    if (!data?.success) {
      console.error("❌ preparePayloadForCreate failed:", data?.error);
      return { data: null, error: data?.error || "Unknown error" };
    }

    return { data: data.payload, breakdown: data.breakdown, error: null };
  } catch (err) {
    console.error("Error in preparePayloadForCreate:", err);
    return { data: null, error: err.message || err };
  }
};
