import * as repo from "../repositories/statistical.repo.js";

export const getMonthlyRevenue = async (year) => {
  const { data, error } = await repo.getMonthlyRevenue(year);
  if (error) {
    return { data: null, error };
  }
  return { data, error: null };
};

export const getStatisticsSummary = async (month, year) => {
  const { data, error } = await repo.getStatisticsSummary(month, year);
  if (error) {
    return { data: null, error };
  }
  return { data: data?.[0] || null, error: null };
};

export const getTopMovies = async (month, year, limit = 5) => {
  const { data, error } = await repo.getTopMovies(month, year, limit);
  if (error) {
    return { data: null, error };
  }
  return { data, error: null };
};

export const getTopCombos = async (month, year, limit = 5) => {
  const { data, error } = await repo.getTopCombos(month, year, limit);
  if (error) {
    return { data: null, error };
  }
  return { data, error: null };
};

export const getTopMenuItems = async (month, year, limit = 6) => {
  const { data, error } = await repo.getTopMenuItems(month, year, limit);
  if (error) {
    return { data: null, error };
  }
  return { data, error: null };
};

export const getGenreDistribution = async (month, year) => {
  const { data, error } = await repo.getGenreDistribution(month, year);
  if (error) {
    return { data: null, error };
  }
  return { data, error: null };
};

// Lấy tất cả thống kê cùng lúc
export const getAllStatistics = async (month, year) => {
  const [
    monthlyRevenueResult,
    summaryResult,
    topMoviesResult,
    topCombosResult,
    topMenuItemsResult,
    genreDistributionResult
  ] = await Promise.all([
    repo.getMonthlyRevenue(year),
    repo.getStatisticsSummary(month, year),
    repo.getTopMovies(month, year, 5),
    repo.getTopCombos(month, year, 5),
    repo.getTopMenuItems(month, year, 6),
    repo.getGenreDistribution(month, year)
  ]);

  const errors = [
    monthlyRevenueResult.error,
    summaryResult.error,
    topMoviesResult.error,
    topCombosResult.error,
    topMenuItemsResult.error,
    genreDistributionResult.error
  ].filter(Boolean);

  if (errors.length > 0) {
    return { data: null, error: errors[0] };
  }

  return {
    data: {
      monthlyRevenue: monthlyRevenueResult.data,
      summary: summaryResult.data?.[0] || null,
      topMovies: topMoviesResult.data,
      topCombos: topCombosResult.data,
      topMenuItems: topMenuItemsResult.data,
      genreDistribution: genreDistributionResult.data
    },
    error: null
  };
};
