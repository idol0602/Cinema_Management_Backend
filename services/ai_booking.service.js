import * as movieService from "../services/movie.service.js";
import * as movieTypeService from "../services/movie_type.service.js";
import * as showTimeService from "../services/show_times.service.js";
import * as showTimeSeatService from "../services/show_time_seats.service.js";
import * as seatService from "../services/seat.service.js";
import * as comboService from "../services/combos.service.js";
import * as menuItemService from "../services/menu_items.service.js";
import * as eventService from "../services/event.service.js";
import * as eventTypeService from "../services/event_type.service.js";
import * as ticketPriceService from "../services/ticket_price.service.js";
import * as formatService from "../services/format.service.js";
import * as orderService from "../services/order.service.js";
import { PAYMENT_METHODS } from "../utils/paymentMethods.js";
import { STEPS } from "../utils/steps.js";
import { redis } from "../config/redis.js";
import { env } from "../config/env.js";

const normalizeMenuItemsForPrepare = (menuItems = []) => {
  if (!Array.isArray(menuItems)) {
    return [];
  }

  return menuItems
    .map((item) => {
      const menuItemId =
        item?.menu_item_id || item?.menuItemId || item?.item_id || item?.id;
      const quantity = Number(item?.quantity || 0);

      if (!menuItemId || quantity <= 0) {
        return null;
      }

      return {
        menu_item_id: menuItemId,
        quantity,
      };
    })
    .filter(Boolean);
};

const normalizeEventId = (eventId) => {
  if (!eventId || eventId === "null" || eventId === "undefined") {
    return null;
  }
  return eventId;
};

export const aiGetNowShowingMovies = async (query = { limit: "" }) => {
  return await movieService.findNowShowing(query);
};

export const aiGetComingSoonMovies = async (query = {}) => {
  return await movieService.findComingSoon(query);
};

export const aiGetMovieById = async (id) => {
  return await movieService.findById(id);
};

export const aiGetMovieTypes = async () => {
  return await movieTypeService.findAll();
};

export const aiGetShowTimes = async (query = {}) => {
  if (!query.filter) {
    query.filter = {};
  }
  if (!query.filter.start_time) {
    query.filter.start_time = { $gte: new Date().toISOString() };
  } else if (!query.filter.start_time.$gte) {
    if (typeof query.filter.start_time === "string") {
      const orig = query.filter.start_time;
      query.filter.start_time = { $gte: orig };
    } else {
      query.filter.start_time.$gte = new Date().toISOString();
    }
  }

  return await showTimeService.findAndPaginate(query);
};

//
export const aiGetShowTimeSeats = async (query = { limit: "", page: 1 }) => {
  return showTimeSeatService.findAndPaginate({
    ...query,
    limit: "",
  });
};

export const aiGetTicketPrices = async (query = {}) => {
  return await ticketPriceService.findAndPaginate(query);
};

export const aiGetFormats = async () => {
  return await formatService.findAll();
};

export const aiGetSeatTypes = async () => {
  return await seatService.findAll();
};

export const aiGetCombos = async (query = {}) => {
  return await comboService.findAndPaginate(query);
};

export const aiGetComboDetails = async (id) => {
  return await comboService.findById(id);
};

export const aiGetMenuItems = async (query = {}) => {
  return await menuItemService.findAndPaginate(query);
};

export const aiGetMenuItemDetails = async (id) => {
  return await menuItemService.findById(id);
};

export const aiGetEvents = async (query = {}) => {
  return await eventService.findAndPaginate(query);
};

export const aiGetEventDetails = async (id) => {
  return await eventService.findById(id);
};

export const aiGetEventTypes = async () => {
  return await eventTypeService.findAll();
};

export const aiGetPaymentMethods = () => {
  return PAYMENT_METHODS;
};

export const aiBulkHoldSeats = async (showTimeSeatIds, userId, ttlSeconds) => {
  return await showTimeSeatService.bulkHoldSeats(
    showTimeSeatIds,
    userId,
    ttlSeconds,
  );
};

export const aiCancelHoldSeats = async (showTimeSeatIds, userId) => {
  return await showTimeSeatService.bulkCancelHoldSeats(showTimeSeatIds, userId);
};

export const createOrder = async (userId) => {
  try {
    if (!userId) {
      return { data: null, error: "User ID is required" };
    }

    const { data: bookingState, error: stateError } =
      await getAiBookingState(userId);
    if (stateError) {
      return { data: null, error: stateError };
    }

    if (
      !bookingState ||
      !bookingState.movieId ||
      !bookingState.showTimeId ||
      !bookingState.showTimeSeatIds?.length
    ) {
      return { data: null, error: "Incomplete booking state" };
    }

    const prepareParams = {
      p_user_id: userId,
      p_movie_id: bookingState.movieId,
      p_show_time_id: bookingState.showTimeId,
      p_show_time_seat_ids: bookingState.showTimeSeatIds,
      p_combo_ids: bookingState.comboIds || [],
      p_menu_items: normalizeMenuItemsForPrepare(bookingState.menuItems),
      p_payment_method: bookingState.paymentMethod || PAYMENT_METHODS.MOMO,
      p_event_id: normalizeEventId(bookingState.eventId),
    };

    console.log("AI booking state snapshot:", {
      userId,
      step: bookingState.step,
      comboCount: bookingState?.comboIds?.length || 0,
      menuItemCount: bookingState?.menuItems?.length || 0,
      hasEvent: !!normalizeEventId(bookingState?.eventId),
    });

    const { data: preparedData, error: prepareError } =
      await orderService.preparePayloadForCreate(prepareParams);

    console.log("prepareData", preparedData);

    if (prepareError) {
      return { data: null, error: prepareError };
    }

    if (!preparedData?.success || !preparedData?.payload) {
      return {
        data: null,
        error: preparedData?.error || "Failed to prepare payload",
      };
    }

    console.log("AI prepare payload summary:", {
      inputEventId: normalizeEventId(bookingState?.eventId),
      orderDiscountId: preparedData?.payload?.order?.discount_id || null,
      ticketCount: preparedData?.payload?.tickets?.length || 0,
      comboCount: preparedData?.payload?.comboItemInTickets?.length || 0,
      menuItemCount: preparedData?.payload?.menuItemInTickets?.length || 0,
    });

    // Call orderService.create with the PREPARED payload
    const createdOrder = await orderService.create(preparedData.payload);
    return createdOrder; // createdOrder already returns { data, error } format
  } catch (error) {
    return { data: null, error };
  }
};

export const preparePayloadForCreate = async (payload) => {
  return await orderService.preparePayloadForCreate(payload);
};

export const getAiBookingState = async (userId) => {
  try {
    const state = await redis.get(`ai_booking_state:${userId}`);
    if (state) {
      return { data: JSON.parse(state), error: null };
    }

    // Initialize default state if not found
    const defaultState = {
      step: STEPS.SELECT_MOVIE,
      movieId: null,
      showTimeId: null,
      showTimeSeatIds: [],
      comboIds: [],
      menuItems: [],
      eventId: null,
      paymentMethod: "",
    };

    await saveAiBookingState(userId, defaultState);

    return { data: defaultState, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const saveAiBookingState = async (userId, state) => {
  try {
    const current = await redis.get(`ai_booking_state:${userId}`);
    const currentState = current
      ? JSON.parse(current)
      : {
          step: STEPS.SELECT_MOVIE,
          movieId: null,
          showTimeId: null,
          showTimeSeatIds: [],
          comboIds: [],
          menuItems: [],
          eventId: null,
          paymentMethod: "",
        };

    const hasOwn = (obj, key) =>
      Object.prototype.hasOwnProperty.call(obj || {}, key);

    const mergedState = {
      ...currentState,
      ...(hasOwn(state, "step") ? { step: state.step } : {}),
      ...(hasOwn(state, "movieId") ? { movieId: state.movieId } : {}),
      ...(hasOwn(state, "showTimeId") ? { showTimeId: state.showTimeId } : {}),
      ...(hasOwn(state, "showTimeSeatIds")
        ? { showTimeSeatIds: state.showTimeSeatIds || [] }
        : {}),
      ...(hasOwn(state, "comboIds") ? { comboIds: state.comboIds || [] } : {}),
      ...(hasOwn(state, "menuItems")
        ? { menuItems: state.menuItems || [] }
        : {}),
      ...(hasOwn(state, "eventId") ? { eventId: state.eventId } : {}),
      ...(hasOwn(state, "paymentMethod")
        ? { paymentMethod: state.paymentMethod }
        : {}),
    };

    // TTL 24 hours (86400 seconds)
    await redis.set(`ai_booking_state:${userId}`, JSON.stringify(mergedState), {
      EX: 86400,
    });
    return { data: mergedState, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const clearAiBookingState = async (userId) => {
  try {
    const rawState = await redis.get(`ai_booking_state:${userId}`);
    const bookingState = rawState ? JSON.parse(rawState) : null;
    const showTimeSeatIds = bookingState?.showTimeSeatIds || [];

    const tasks = [redis.del(`ai_booking_state:${userId}`)];
    if (showTimeSeatIds.length > 0) {
      tasks.push(
        showTimeSeatService.bulkCancelHoldSeats(showTimeSeatIds, userId),
      );
    }

    const [deleteResult, cancelResult] = await Promise.allSettled(tasks);

    if (deleteResult.status === "rejected") {
      return { data: null, error: deleteResult.reason };
    }

    if (cancelResult && cancelResult.status === "rejected") {
      return { data: null, error: cancelResult.reason };
    }

    if (
      cancelResult &&
      cancelResult.status === "fulfilled" &&
      cancelResult.value?.error
    ) {
      return { data: null, error: cancelResult.value.error };
    }

    return {
      data: {
        cleared: true,
        cancelledHolds: showTimeSeatIds,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
};

export const getAiBookingStateDetails = async (userId) => {
  try {
    const { data: bookingState, error: stateError } =
      await getAiBookingState(userId);
    if (stateError) {
      return { data: null, error: stateError };
    }

    const params = {
      p_user_id: userId,
      p_movie_id: bookingState?.movieId || null,
      p_show_time_id: bookingState?.showTimeId || null,
      p_show_time_seat_ids: bookingState?.showTimeSeatIds || [],
      p_combo_ids: bookingState?.comboIds || [],
      p_menu_items: normalizeMenuItemsForPrepare(bookingState?.menuItems),
      p_event_id: normalizeEventId(bookingState?.eventId),
      p_payment_method: bookingState?.paymentMethod || PAYMENT_METHODS.CASH,
    };

    const { data, error } = await orderService.getAiBookingStateDetails(params);
    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const chatWithAgent = async (userId, message) => {
  try {
    const response = await fetch(env.AGENT_BOOKING_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, message }),
    });
    if (!response.ok) {
      return { data: null, error: `Agent returned status ${response.status}` };
    }
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message || error };
  }
};
