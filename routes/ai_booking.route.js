import { Router } from "express";
import * as controller from "../controllers/ai_booking.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/movies/now-showing", controller.getNowShowingMovies);
router.get("/movies/coming-soon", controller.getComingSoonMovies);
router.get("/movies/:id", controller.getMovieById);

router.get("/movie-types", controller.getMovieTypes);

router.get("/show-times", controller.getShowTimes);
router.get("/show-time-seats", controller.getShowTimeSeats);

router.get("/ticket-prices", controller.getTicketPrices);

router.get("/formats", controller.getFormats);
router.get("/seat-types", controller.getSeatTypes);

router.get("/combos", controller.getCombos);
router.get("/combos/:id", controller.getComboDetails);

router.get("/menu-items", controller.getMenuItems);
router.get("/menu-items/:id", controller.getMenuItemDetails);

router.get("/events", controller.getEvents);
router.get("/events/:id", controller.getEventDetails);
router.get("/event-types", controller.getEventTypes);

router.get("/payment-methods", controller.getPaymentMethods);

router.post("/hold/bulk", controller.bulkHoldSeats);
router.delete("/hold/bulk", controller.cancelHoldSeats);
router.post("/bookings", controller.createBooking);
router.post("/bookings/prepare", controller.preparePayloadForCreate);

router.get("/state/:id", controller.getAiBookingState);
router.get("/state/:id/details", controller.getAiBookingStateDetails);
router.post("/state", controller.saveAiBookingState);
router.delete("/state/:id", controller.clearAiBookingState);

router.post("/chat", controller.chatWithAgent);

export default router;
