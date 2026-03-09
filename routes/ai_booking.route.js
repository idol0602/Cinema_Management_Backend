import { Router } from "express";
import * as controller from "../controllers/ai_booking.controller.js";

const router = Router();

router.get("/movies/now-showing", controller.getNowShowingMovies);
router.get("/movies/coming-soon", controller.getComingSoonMovies);
router.get("/movies/:id", controller.getMovieById);

router.get("/movie-types", controller.getMovieTypes);

router.get("/show-times", controller.getShowTimes);
router.get("/show-times/:id/seats", controller.getShowTimeSeatsByShowTimeId);

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

export default router;
