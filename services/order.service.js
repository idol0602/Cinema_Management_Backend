import * as repo from "../repositories/order.repo.js";
import * as ticketRepo from "../repositories/ticket.repo.js";
import * as comboItemInTicketRepo from "../repositories/combo_item_in_tickets.repo.js";
import * as menuItemInTicketRepo from "../repositories/menu_item_in_tickets.repo.js";
import * as showTimeSeatRepo from "../repositories/show_time_seats.repo.js";
import { v4 as uuidv4 } from "uuid";
import { PAYMENT_STATUS } from "../utils/paymentStatus.js";
import { generateQrBuffer } from "../utils/qr.js";
import { generateQrToken } from "../utils/qrToken.js";
import { SEAT_STATUS } from "../utils/seatStatus.js";
import { PAYMENT_METHODS } from "../utils/paymentMethods.js";
import { Producer } from "../rabbitmq/producer.js";
import { TYPE_MAIL } from "../utils/mail.js";
import { uploadBuffer } from "./cloudinary.service.js";
import { validateBookingTime, processOrderInventory, validateStock } from "./inventory.service.js";

export const create = (order) => {
  const movieWithId = {
    ...order,
    id: uuidv4(),
    payment_status: PAYMENT_STATUS.PENDING,
    payment_method: order.payment_method,
  };
  return repo.create(movieWithId);
};
export const findAll = () => repo.findAll();
export const findById = (id) => repo.findById(id);
export const update = (id, data) => repo.update(id, data);
export const findAndPaginate = (query) => repo.findAndPaginate(query);
export const getOrderDetails = (orderId) => repo.getOrderDetails(orderId);

export const handleOrderAndRelatedData = async (payload) => {
  const {
    order,
    tickets,
    comboItemInTickets,
    menuItemInTickets,
    showTime
  } = payload;

  order.payment_method = payload.order.payment_method || PAYMENT_METHODS.CASH;
  order.payment_status = PAYMENT_STATUS.COMPLETED;
  try {
    // 0. Validate booking time (5 minutes before showtime cutoff)
    if (showTime?.start_time) {
      const timeValidation = validateBookingTime(showTime.start_time, 5);
      if (!timeValidation.valid) {
        console.error("⏰ Booking time validation failed:", timeValidation.message);
        return { 
          data: null, 
          error: timeValidation.message 
        };
      }
      console.log(`⏰ Booking time valid: ${timeValidation.message}`);
    }

    // 0.5. Validate stock BEFORE creating any order data
    const comboIds = (comboItemInTickets || []).map(c => c.combo_id);
    const stockValidation = await validateStock(menuItemInTickets || [], comboIds);
    if (!stockValidation.valid) {
      console.error("📦 Stock validation failed:", stockValidation.errors);
      return { 
        data: null, 
        error: {
          message: "Không đủ số lượng trong kho cho một hoặc nhiều sản phẩm",
          code: 'INSUFFICIENT_STOCK',
          details: stockValidation.errors
        }
      };
    }
    console.log("📦 Stock validation passed");

    // 1. Update order (without changing payment_status - left for flexibility)
    const { data: orderData, error: orderError } = await repo.update(order.id, {
      ...order
    });

    if (orderError) {
      return { data: null, error: orderError };
    }

    // Calculate token expiration based on showTime end_time
    // Token should expire after the movie ends
    let tokenExpiry = "24h"; // default
    if (showTime?.end_time) {
      const endTime = new Date(showTime.end_time);
      const now = new Date();
      const diffMs = endTime.getTime() - now.getTime();
      
      if (diffMs > 0) {
        // Add 30 minutes buffer after movie ends
        const expiryMs = diffMs + (30 * 60 * 1000);
        const expirySeconds = Math.ceil(expiryMs / 1000);
        tokenExpiry = `${expirySeconds}s`;
      }
    }

    // 2. Create tickets with QR codes (upload to Cloudinary)
    const ticketPromises = tickets.map(async (ticket) => {
      const ticketId = uuidv4();
      // Generate QR token (JWT with ticket ID, expires when movie ends + 30 min)
      const qrToken = generateQrToken({ ticketId }, tokenExpiry);
      
      // Generate QR code as buffer and upload to Cloudinary
      const qrBuffer = await generateQrBuffer(qrToken);
      const { url: qrCodeUrl } = await uploadBuffer(qrBuffer, "cinema_tickets", `ticket_${ticketId}`);

      // Update seat status to BOOKED
      await showTimeSeatRepo.update(ticket.showtime_seat_id, {
        status_seat: SEAT_STATUS.BOOKED
      });
      
      // Clear Redis hold key since seat is now confirmed
      await showTimeSeatRepo.clearHoldOnConfirm(ticket.showtime_seat_id, order.user_id);
      
      return ticketRepo.create({
        ...ticket,
        id: ticketId,
        order_id: order.id,
        qr_code: qrCodeUrl, // Store Cloudinary URL instead of JWT token
        checked_in: false
      });
    });

    const ticketResults = await Promise.all(ticketPromises);
    const ticketsData = ticketResults.map(r => r.data);
    const ticketErrors = ticketResults.filter(r => r.error).map(r => r.error);

    if (ticketErrors.length > 0) {
      console.error("Ticket creation errors:", ticketErrors);
    }

    // 3. Create combo items in tickets
    let comboItemsData = [];
    if (comboItemInTickets && comboItemInTickets.length > 0) {
      const comboItemPromises = comboItemInTickets.map((comboItem) => {
        return comboItemInTicketRepo.create({
          ...comboItem,
          id: uuidv4(),
          order_id: order.id
        });
      });

      const comboItemResults = await Promise.all(comboItemPromises);
      comboItemsData = comboItemResults.map(r => r.data);
      const comboErrors = comboItemResults.filter(r => r.error).map(r => r.error);

      if (comboErrors.length > 0) {
        console.error("Combo item creation errors:", comboErrors);
      }
    }

    // 4. Create menu items in tickets
    let menuItemsData = [];
    if (menuItemInTickets && menuItemInTickets.length > 0) {
      const menuItemPromises = menuItemInTickets.map((menuItem) => {
        return menuItemInTicketRepo.create({
          ...menuItem,
          id: uuidv4(),
          order_id: order.id
        });
      });

      const menuItemResults = await Promise.all(menuItemPromises);
      menuItemsData = menuItemResults.map(r => r.data);
      const menuErrors = menuItemResults.filter(r => r.error).map(r => r.error);

      if (menuErrors.length > 0) {
        console.error("Menu item creation errors:", menuErrors);
      }
    }

    // 5. Deduct inventory after successful payment processing
    const inventoryResult = await processOrderInventory(
      menuItemInTickets || [],
      comboItemInTickets || []
    );
    
    if (!inventoryResult.success) {
      console.error("⚠️ Inventory deduction failed - insufficient stock:", inventoryResult.error);
      return { 
        data: null, 
        error: {
          message: "Không đủ số lượng trong kho cho một hoặc nhiều sản phẩm",
          code: 'INSUFFICIENT_STOCK',
          details: inventoryResult.results
        }
      };
    }

    // Return structured response with all data
    return {
      data: {
        order: orderData || order,
        tickets: ticketsData,
        comboItemInTickets: comboItemsData,
        menuItemInTickets: menuItemsData,
        inventoryResult: inventoryResult.results
      },
      error: null
    };

  } catch (error) {
    console.error("Error in handleOrderAndRelatedData:", error);
    return { data: null, error: error.message || error };
  }
};

export const getOrderHistory = async (userId, query) => {
  query.filter = {
    user_id: userId,
  }
  return await repo.findAndPaginate(query);
}

