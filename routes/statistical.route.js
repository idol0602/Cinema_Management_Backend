import { Router } from "express";
import * as controller from "../controllers/statistical.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { METHODS } from "../utils/method.js";

const rootPath = "/statistics";
const router = Router();

// GET /api/statistics - Lấy tất cả thống kê
router.get(
  "/",
  auth,
  authorize(rootPath, METHODS.GET),
  controller.getAllStatistics
);

// GET /api/statistics/monthly-revenue - Doanh thu theo tháng
router.get(
  "/monthly-revenue",
  auth,
  authorize(rootPath, METHODS.GET),
  controller.getMonthlyRevenue
);

// GET /api/statistics/summary - Tổng quan
router.get(
  "/summary",
  auth,
  authorize(rootPath, METHODS.GET),
  controller.getStatisticsSummary
);

// GET /api/statistics/top-movies - Top phim
router.get(
  "/top-movies",
  auth,
  authorize(rootPath, METHODS.GET),
  controller.getTopMovies
);

// GET /api/statistics/top-combos - Top combo
router.get(
  "/top-combos",
  auth,
  authorize(rootPath, METHODS.GET),
  controller.getTopCombos
);

// GET /api/statistics/top-menu-items - Top menu items
router.get(
  "/top-menu-items",
  auth,
  authorize(rootPath, METHODS.GET),
  controller.getTopMenuItems
);

// GET /api/statistics/genre-distribution - Phân bố thể loại
router.get(
  "/genre-distribution",
  auth,
  authorize(rootPath, METHODS.GET),
  controller.getGenreDistribution
);

export default router;
