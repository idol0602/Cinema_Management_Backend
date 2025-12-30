import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.route.js";
import movieRoutes from "./routes/movie.route.js";
import userRoutes from "./routes/user.route.js";
import roomRouters from "./routes/room.router.js";
import combosRoutes from "./routes/combos.route.js";
import comboItemsRoutes from "./routes/combo_items.route.js";
import comboMoviesRoutes from "./routes/combo_movies.route.js";
import combosEventsRoutes from "./routes/combos_events.route.js";
import comboItemInTicketsRoutes from "./routes/combo_item_in_tickets.route.js";
import commentRoutes from "./routes/comment.route.js";
import discountRoutes from "./routes/discount.route.js";
import eventRoutes from "./routes/event.route.js";
import menuItemsRoutes from "./routes/menu_items.route.js";
import menuItemInTicketsRoutes from "./routes/menu_item_in_tickets.route.js";
import movieTypesRoutes from "./routes/movie_types.route.js";
import postRoutes from "./routes/post.route.js";
import rateRoutes from "./routes/rate.route.js";
import seatRoutes from "./routes/seat.route.js";
import showTimesRoutes from "./routes/show_times.route.js";
import showTimeSeatsRoutes from "./routes/show_time_seats.route.js";
import slideRoutes from "./routes/slide.route.js";
import ticketPricesRoutes from "./routes/ticket_prices.route.js";
import ticketRoutes from "./routes/ticket.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// app.set('trust proxy', 1);

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
// });

// app.use(limiter);

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRouters);
app.use("/api/combos", combosRoutes);
app.use("/api/combo-items", comboItemsRoutes);
app.use("/api/combo-movies", comboMoviesRoutes);
app.use("/api/combos-events", combosEventsRoutes);
app.use("/api/combo-item-in-tickets", comboItemInTicketsRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/menu-items", menuItemsRoutes);
app.use("/api/menu-item-in-tickets", menuItemInTicketsRoutes);
app.use("/api/movie-types", movieTypesRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/rates", rateRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/show-times", showTimesRoutes);
app.use("/api/show-time-seats", showTimeSeatsRoutes);
app.use("/api/slides", slideRoutes);
app.use("/api/ticket-prices", ticketPricesRoutes);
app.use("/api/tickets", ticketRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

app.use(errorHandler);

export default app;
