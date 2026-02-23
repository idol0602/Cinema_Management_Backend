import * as repo from "../repositories/order.repo.js";
import * as showTimeSeatRepo from "../repositories/show_time_seats.repo.js";
import { v4 as uuidv4 } from "uuid";
import { PAYMENT_STATUS } from "../utils/paymentStatus.js";
import { generateQrBuffer } from "../utils/qr.js";
import { generateQrToken } from "../utils/qrToken.js";
import { PAYMENT_METHODS } from "../utils/paymentMethods.js";
import { Producer } from "../rabbitmq/producer.js";
import { TYPE_MAIL } from "../utils/mail.js";
import { uploadBuffer } from "./cloudinary.service.js";
import { validateBookingTime, validateStock } from "./inventory.service.js";
import { createPayment as momoCreatePayment } from "./payment/momo.service.js";
import { createPayment as vnpayCreatePayment } from "./payment/vnpay.service.js";
import { toVietnamTime } from "../utils/formatTime.js";

export const create = async (payload) => {
  const { order, tickets, comboItemInTickets, menuItemInTickets, showTime } =
    payload;

  const orderId = uuidv4();
  order.id = orderId;
  order.payment_method = order.payment_method || PAYMENT_METHODS.CASH;

  try {
    // 1. Validate booking time (5 minutes before showtime cutoff)
    if (showTime?.start_time) {
      const timeValidation = validateBookingTime(showTime.start_time, 5);
      if (!timeValidation.valid) {
        console.error(
          "⏰ Booking time validation failed:",
          timeValidation.message,
        );
        return { data: null, error: timeValidation.message };
      }
      console.log(`⏰ Booking time valid: ${timeValidation.message}`);
    }

    // 2. Validate stock BEFORE creating any order data
    const comboIds = (comboItemInTickets || []).map((c) => c.combo_id);
    const stockValidation = await validateStock(
      menuItemInTickets || [],
      comboIds,
    );
    if (!stockValidation.valid) {
      console.error("📦 Stock validation failed:", stockValidation.errors);
      return {
        data: null,
        error: {
          message: "Không đủ số lượng trong kho cho một hoặc nhiều sản phẩm",
          code: "INSUFFICIENT_STOCK",
          details: stockValidation.errors,
        },
      };
    }
    console.log("📦 Stock validation passed");

    // 3. Calculate token expiration based on showTime end_time
    let tokenExpiry = "24h";
    if (showTime?.end_time) {
      const endTime = new Date(showTime.end_time);
      const now = new Date();
      const diffMs = endTime.getTime() - now.getTime();
      if (diffMs > 0) {
        const expiryMs = diffMs + 30 * 60 * 1000;
        const expirySeconds = Math.ceil(expiryMs / 1000);
        tokenExpiry = `${expirySeconds}s`;
      }
    }

    // 4. Generate QR codes & upload to Cloudinary BEFORE RPC
    const ticketsForRpc = await Promise.all(
      (tickets || []).map(async (ticket) => {
        const ticketId = uuidv4();
        const qrToken = generateQrToken({ ticketId }, tokenExpiry);
        const qrBuffer = await generateQrBuffer(qrToken);
        const { url: qrCodeUrl } = await uploadBuffer(
          qrBuffer,
          "cinema_tickets",
          `ticket_${ticketId}`,
        );
        return {
          ...ticket,
          id: ticketId,
          order_id: orderId,
          qr_code: qrCodeUrl,
          checked_in: false,
        };
      }),
    );

    // 5. Prepare combo items for RPC
    const comboItemsForRpc = (comboItemInTickets || []).map((comboItem) => ({
      ...comboItem,
      id: uuidv4(),
      order_id: orderId,
    }));

    // 6. Prepare menu items for RPC
    const menuItemsForRpc = (menuItemInTickets || []).map((menuItem) => ({
      ...menuItem,
      id: uuidv4(),
      order_id: orderId,
    }));

    // 7. Call atomic RPC create_order_and_related_data
    const rpcPayload = {
      order: {
        id: orderId,
        user_id: order.user_id,
        movie_id: order.movie_id,
        payment_method: order.payment_method,
        discount_id: order.discount_id || null,
        service_vat: order.service_vat || 0,
        total_price: order.total_price || 0,
        trans_id: order.trans_id || null,
      },
      tickets: ticketsForRpc,
      combo_items: comboItemsForRpc,
      menu_items: menuItemsForRpc,
    };

    const { data: rpcResult, error: rpcError } =
      await repo.createOrderRpc(rpcPayload);

    if (rpcError) {
      console.error("❌ Create order RPC error:", rpcError);
      return { data: null, error: rpcError };
    }

    if (!rpcResult?.success) {
      console.error("❌ Create order RPC returned failure:", rpcResult?.error);
      const errorMsg = rpcResult?.error || "Unknown RPC error";

      if (
        typeof errorMsg === "string" &&
        errorMsg.includes("Insufficient stock")
      ) {
        return {
          data: null,
          error: {
            message: "Không đủ số lượng trong kho cho một hoặc nhiều sản phẩm",
            code: "INSUFFICIENT_STOCK",
            details: errorMsg,
          },
        };
      }

      return { data: null, error: errorMsg };
    }

    console.log("✅ Create order RPC transaction completed successfully");

    return {
      data: {
        order: rpcResult.order,
        tickets: rpcResult.tickets,
        comboItemInTickets: rpcResult.combo_items,
        menuItemInTickets: rpcResult.menu_items,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error in create order:", error);
    return { data: null, error: error.message || error };
  }
};
export const findAll = () => repo.findAll();
export const findById = (id) => repo.findById(id);
export const update = (id, data) => repo.update(id, data);
export const findAndPaginate = (query) => repo.findAndPaginate(query);
export const getOrderDetails = (orderId) => repo.getOrderDetails(orderId);

export const handleOrderAndRelatedData = async (payload) => {
  const { order, tickets, comboItemInTickets, menuItemInTickets, showTime } =
    payload;

  order.payment_method = payload.order.payment_method || PAYMENT_METHODS.CASH;
  order.payment_status = PAYMENT_STATUS.COMPLETED;
  try {
    // 0. Validate booking time (5 minutes before showtime cutoff)
    if (showTime?.start_time) {
      const timeValidation = validateBookingTime(showTime.start_time, 5);
      if (!timeValidation.valid) {
        console.error(
          "⏰ Booking time validation failed:",
          timeValidation.message,
        );
        return {
          data: null,
          error: timeValidation.message,
        };
      }
      console.log(`⏰ Booking time valid: ${timeValidation.message}`);
    }

    // 0.5. Validate stock BEFORE creating any order data
    const comboIds = (comboItemInTickets || []).map((c) => c.combo_id);
    const stockValidation = await validateStock(
      menuItemInTickets || [],
      comboIds,
    );
    if (!stockValidation.valid) {
      console.error("📦 Stock validation failed:", stockValidation.errors);
      return {
        data: null,
        error: {
          message: "Không đủ số lượng trong kho cho một hoặc nhiều sản phẩm",
          code: "INSUFFICIENT_STOCK",
          details: stockValidation.errors,
        },
      };
    }
    console.log("📦 Stock validation passed");

    // Calculate token expiration based on showTime end_time
    let tokenExpiry = "24h"; // default
    if (showTime?.end_time) {
      const endTime = new Date(showTime.end_time);
      const now = new Date();
      const diffMs = endTime.getTime() - now.getTime();

      if (diffMs > 0) {
        const expiryMs = diffMs + 30 * 60 * 1000;
        const expirySeconds = Math.ceil(expiryMs / 1000);
        tokenExpiry = `${expirySeconds}s`;
      }
    }

    // 1. Generate QR codes & upload to Cloudinary BEFORE RPC
    // (External service calls cannot be rolled back)
    const ticketsForRpc = await Promise.all(
      tickets.map(async (ticket) => {
        const ticketId = uuidv4();
        const qrToken = generateQrToken({ ticketId }, tokenExpiry);
        const qrBuffer = await generateQrBuffer(qrToken);
        const { url: qrCodeUrl } = await uploadBuffer(
          qrBuffer,
          "cinema_tickets",
          `ticket_${ticketId}`,
        );

        return {
          ...ticket,
          id: ticketId,
          order_id: order.id,
          qr_code: qrCodeUrl,
          checked_in: false,
        };
      }),
    );

    // 2. Prepare combo items for RPC
    const comboItemsForRpc = (comboItemInTickets || []).map((comboItem) => ({
      ...comboItem,
      id: uuidv4(),
      order_id: order.id,
    }));

    // 3. Prepare menu items for RPC
    const menuItemsForRpc = (menuItemInTickets || []).map((menuItem) => ({
      ...menuItem,
      id: uuidv4(),
      order_id: order.id,
    }));

    // 4. Call atomic RPC - all DB operations in one transaction
    const rpcPayload = {
      order: {
        id: order.id,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        discount_id: order.discount_id || null,
        service_vat: order.service_vat || null,
        total_price: order.total_price || null,
        trans_id: order.trans_id || null,
      },
      tickets: ticketsForRpc,
      combo_items: comboItemsForRpc,
      menu_items: menuItemsForRpc,
    };

    const { data: rpcResult, error: rpcError } =
      await repo.handleOrderRpc(rpcPayload);

    if (rpcError) {
      console.error("❌ RPC error:", rpcError);
      return { data: null, error: rpcError };
    }

    if (!rpcResult?.success) {
      console.error("❌ RPC returned failure:", rpcResult?.error);
      const errorMsg = rpcResult?.error || "Unknown RPC error";

      // Check if it's an insufficient stock error
      if (
        typeof errorMsg === "string" &&
        errorMsg.includes("Insufficient stock")
      ) {
        return {
          data: null,
          error: {
            message: "Không đủ số lượng trong kho cho một hoặc nhiều sản phẩm",
            code: "INSUFFICIENT_STOCK",
            details: errorMsg,
          },
        };
      }

      return { data: null, error: errorMsg };
    }

    console.log("✅ RPC order transaction completed successfully");

    // 5. Clear Redis hold keys (non-DB operation, safe to do after RPC)
    for (const ticket of ticketsForRpc) {
      await showTimeSeatRepo.clearHoldOnConfirm(
        ticket.showtime_seat_id,
        order.user_id,
      );
    }

    // Return structured response
    return {
      data: {
        order: rpcResult.order,
        tickets: rpcResult.tickets,
        comboItemInTickets: rpcResult.combo_items,
        menuItemInTickets: rpcResult.menu_items,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error in handleOrderAndRelatedData:", error);
    return { data: null, error: error.message || error };
  }
};

/**
 * Build email template data from order details (from get_order_details RPC)
 */
const buildEmailData = (details) => {
  const order = details.order || {};
  const movie = details.movie || {};
  const ticketsList = details.tickets || [];
  const discount = details.discount || null;
  const event = details.event || null;
  const combosList = details.combos || [];
  const menuItemsList = details.menu_items || [];

  // Get showtime/room from first ticket
  const firstTicket = ticketsList[0] || {};
  const showtime = firstTicket.showtime || {};
  const room = showtime.room || {};

  // Format tickets for template
  const tickets = ticketsList.map((t, index) => ({
    ticketNumber: index + 1,
    seatName: t.showtime_seat?.seat?.seat_number || "N/A",
    seatType: t.showtime_seat?.seat?.seat_type?.name || "N/A",
    price: Number(t.ticket_price?.price || 0).toLocaleString("vi-VN"),
    qrCodeUrl: t.qr_code || "",
  }));

  // Format combos for template
  const combos = combosList.map((c) => ({
    comboName: c.combo?.name || "N/A",
    comboPrice: Number(c.combo?.total_price || 0).toLocaleString("vi-VN"),
    comboDescription: c.combo?.description || "",
    comboItems: (c.combo?.items || []).map((item) => ({
      itemName: item.menu_item?.name || "N/A",
      itemQuantity: item.quantity || 0,
      itemPrice: Number(item.unit_price || 0).toLocaleString("vi-VN"),
    })),
  }));

  // Format menu items for template
  const menuItems = menuItemsList.map((m) => ({
    itemName: m.item?.name || "N/A",
    itemQuantity: m.quantity || 0,
    itemUnitPrice: Number(m.unit_price || 0).toLocaleString("vi-VN"),
    itemTotalPrice: Number(m.total_price || 0).toLocaleString("vi-VN"),
    itemImage: m.item?.image || "",
  }));

  // Movie genres
  const movieGenres = (movie.movie_types || []).map((mt) => mt.type).join(", ");

  // Payment method display
  const paymentMethodMap = {
    CASH: "Tiền mặt",
    MOMO: "MoMo",
    VNPAY: "VNPay",
  };

  return {
    orderId: order.id || "",
    orderDate: order.created_at ? toVietnamTime(order.created_at) : "",
    totalAmount: Number(order.total_price || 0).toLocaleString("vi-VN"),
    paymentMethod:
      paymentMethodMap[order.payment_method] || order.payment_method || "",
    serviceVat: order.service_vat
      ? Number(order.service_vat).toLocaleString("vi-VN")
      : null,
    movieTitle: movie.title || "",
    movieDuration: movie.duration ? `${movie.duration} phút` : "",
    movieGenres: movieGenres,
    movieImage: movie.image || "",
    showTime: showtime.start_time ? toVietnamTime(showtime.start_time) : "",
    endTime: showtime.end_time ? toVietnamTime(showtime.end_time) : "",
    roomName: room.name || "",
    roomFormat: room.format?.name || "",
    hasDiscount: !!discount,
    discountName: discount?.name || "",
    discountPercent: discount?.discount_percent || 0,
    hasEvent: !!event,
    eventName: event?.name || "",
    eventDescription: event?.description || "",
    hasCombos: combos.length > 0,
    combos,
    hasMenuItems: menuItems.length > 0,
    menuItems,
    tickets,
    ticketCount: tickets.length,
  };
};

export const getOrderHistory = async (userId, query) => {
  query.filter = {
    user_id: userId,
  };
  return await repo.findAndPaginate(query);
};

export const createPaymentUrl = async (payload) => {
  const { orderId, amount, paymentMethod } = payload;
  let paymentURL = "";
  switch (paymentMethod) {
    case PAYMENT_METHODS.MOMO: {
      const { momoData, message } = await momoCreatePayment({
        orderId,
        amount,
      });
      paymentURL = momoData;
      if (momoData) {
        return {
          data: {
            paymentURL,
            message,
          },
          error: null,
        };
      } else {
        return {
          data: null,
          error: {
            message,
          },
        };
      }
    }
    case PAYMENT_METHODS.VNPAY: {
      const { vnpayData, message } = await vnpayCreatePayment({
        orderId,
        amount,
      });
      paymentURL = vnpayData;
      if (vnpayData) {
        return {
          data: {
            paymentURL,
            message,
          },
          error: null,
        };
      } else {
        return {
          data: null,
          error: {
            message,
          },
        };
      }
    }
    default:
      return {
        data: null,
        error: {
          message: "Invalid payment method",
        },
      };
  }
};

export const handleCallBack = async (payload) => {
  const { orderId, status, transId, amount } = payload;

  console.log("📥 handleCallBack called:", { orderId, status, transId, amount });

  // Determine internal status from callback status
  let mappedStatus = PAYMENT_STATUS.FAILED;
  if (status === "PAID") {
    mappedStatus = PAYMENT_STATUS.COMPLETED;
  } else if (status === "CANCELED") {
    mappedStatus = PAYMENT_STATUS.CANCELED;
  } else {
    mappedStatus = PAYMENT_STATUS.FAILED;
  }

  const { data: rpcResult, error: rpcError } = await repo.updateOrderRpc(
    orderId,
    mappedStatus,
    transId,
  );

    if (rpcError) {
      console.error("❌ RPC error:", rpcError);
      return { data: null, error: rpcError };
    }

    if (!rpcResult?.success) {
      console.error("❌ RPC returned failure:", rpcResult?.error);
      const errorMsg = rpcResult?.error || "Unknown RPC error";
      
      // Check if it's an insufficient stock error
      if (typeof errorMsg === 'string' && errorMsg.includes('Insufficient stock')) {
        return {
          data: null,
          error: {
            message: "Không đủ số lượng trong kho cho một hoặc nhiều sản phẩm",
            code: 'INSUFFICIENT_STOCK',
            details: errorMsg
          }
        };
      }
      
      return { data: null, error: errorMsg };
    }

    console.log("✅ handleCallBack RPC completed for order:", orderId);

    // 5. Clear Redis hold keys (non-DB operation, safe to do after RPC)
    // Fetch full order details to get the tickets list
    try {
      const { data: orderDetails } = await repo.getOrderDetails(orderId);
      if (orderDetails && orderDetails.tickets) {
        for (const ticket of orderDetails.tickets) {
          await showTimeSeatRepo.clearHoldOnConfirm(
            ticket.showtime_seat_id,
            orderDetails.user?.id || orderDetails.user_id,
          );
        }
        console.log("🧹 Redis holds cleared for order:", orderId);
      }
    } catch (clearError) {
      console.error("⚠️ Failed to clear Redis holds in callback:", clearError);
    }

    // Send confirmation email via RabbitMQ (only on successful payment)
    if (status === "PAID") {
      try {
        const { data: orderDetails, error: detailsError } =
          await repo.getOrderDetails(orderId);

        if (!detailsError && orderDetails) {
          const emailData = buildEmailData(orderDetails);
          Producer.mail({
            type: TYPE_MAIL.ORDER_CONFIRMATION,
            payload: {
              to: orderDetails.user?.email,
              orderData: emailData
            }
          });
          console.log("📧 Order confirmation email queued for:", orderDetails.user?.email);
        } else {
          console.error("⚠️ Could not fetch order details for email:", detailsError);
        }
      } catch (emailError) {
        // Email failure should not fail the order
        console.error("⚠️ Failed to queue confirmation email:", emailError);
      }
    }

    return {
      data: {
        order: rpcResult.order,
        tickets: rpcResult.tickets,
        comboItemInTickets: rpcResult.combo_items,
        menuItemInTickets: rpcResult.menu_items
      },
      error: null
    };
};
