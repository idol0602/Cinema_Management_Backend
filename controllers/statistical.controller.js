import * as service from "../services/statistical.service.js";
import { success, fail } from "../utils/response.js";

export const getMonthlyRevenue = async (req, res, next) => {
  try {
    const { year } = req.query;
    const yearNum = parseInt(year) || new Date().getFullYear();

    const { data, error } = await service.getMonthlyRevenue(yearNum);
    if (error) {
      return fail(res, error.message || "Failed to get monthly revenue");
    }
    return success(res, data, "Get monthly revenue successfully");
  } catch (e) {
    next(e);
  }
};

export const getStatisticsSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const monthNum = parseInt(month) || new Date().getMonth() + 1;
    const yearNum = parseInt(year) || new Date().getFullYear();

    const { data, error } = await service.getStatisticsSummary(
      monthNum,
      yearNum,
    );
    if (error) {
      return fail(res, error.message || "Failed to get statistics summary");
    }
    return success(res, data, "Get statistics summary successfully");
  } catch (e) {
    next(e);
  }
};

export const getTopMovies = async (req, res, next) => {
  try {
    const { month, year, limit } = req.query;
    const monthNum = parseInt(month) || new Date().getMonth() + 1;
    const yearNum = parseInt(year) || new Date().getFullYear();
    const limitNum = parseInt(limit) || 5;

    const { data, error } = await service.getTopMovies(
      monthNum,
      yearNum,
      limitNum,
    );
    if (error) {
      return fail(res, error.message || "Failed to get top movies");
    }
    return success(res, data, "Get top movies successfully");
  } catch (e) {
    next(e);
  }
};

export const getTopCombos = async (req, res, next) => {
  try {
    const { month, year, limit } = req.query;
    const monthNum = parseInt(month) || new Date().getMonth() + 1;
    const yearNum = parseInt(year) || new Date().getFullYear();
    const limitNum = parseInt(limit) || 5;

    const { data, error } = await service.getTopCombos(
      monthNum,
      yearNum,
      limitNum,
    );
    if (error) {
      return fail(res, error.message || "Failed to get top combos");
    }
    return success(res, data, "Get top combos successfully");
  } catch (e) {
    next(e);
  }
};

export const getTopMenuItems = async (req, res, next) => {
  try {
    const { month, year, limit } = req.query;
    const monthNum = parseInt(month) || new Date().getMonth() + 1;
    const yearNum = parseInt(year) || new Date().getFullYear();
    const limitNum = parseInt(limit) || 6;

    const { data, error } = await service.getTopMenuItems(
      monthNum,
      yearNum,
      limitNum,
    );
    if (error) {
      return fail(res, error.message || "Failed to get top menu items");
    }
    return success(res, data, "Get top menu items successfully");
  } catch (e) {
    next(e);
  }
};

export const getGenreDistribution = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const monthNum = parseInt(month) || new Date().getMonth() + 1;
    const yearNum = parseInt(year) || new Date().getFullYear();

    const { data, error } = await service.getGenreDistribution(
      monthNum,
      yearNum,
    );
    if (error) {
      return fail(res, error.message || "Failed to get genre distribution");
    }
    return success(res, data, "Get genre distribution successfully");
  } catch (e) {
    next(e);
  }
};

export const getAllStatistics = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const monthNum = parseInt(month) || new Date().getMonth() + 1;
    const yearNum = parseInt(year) || new Date().getFullYear();

    const { data, error } = await service.getAllStatistics(monthNum, yearNum);
    if (error) {
      return fail(res, error.message || "Failed to get all statistics");
    }
    return success(res, data, "Get all statistics successfully");
  } catch (e) {
    next(e);
  }
};

export const exportExcel = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const monthNum = parseInt(month) || new Date().getMonth() + 1;
    const yearNum = parseInt(year) || new Date().getFullYear();

    const { data, error } = await service.exportStatisticsExcel(
      monthNum,
      yearNum,
    );
    if (error) {
      return fail(res, error.message || "Failed to export statistics");
    }

    const fileName = `Thong_Ke_Thang_${monthNum}_${yearNum}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.send(data);
  } catch (e) {
    next(e);
  }
};
