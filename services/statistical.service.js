import * as repo from "../repositories/statistical.repo.js";
import XLSX from "xlsx";

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
    genreDistributionResult,
  ] = await Promise.all([
    repo.getMonthlyRevenue(year),
    repo.getStatisticsSummary(month, year),
    repo.getTopMovies(month, year, 5),
    repo.getTopCombos(month, year, 5),
    repo.getTopMenuItems(month, year, 6),
    repo.getGenreDistribution(month, year),
  ]);

  const errors = [
    monthlyRevenueResult.error,
    summaryResult.error,
    topMoviesResult.error,
    topCombosResult.error,
    topMenuItemsResult.error,
    genreDistributionResult.error,
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
      genreDistribution: genreDistributionResult.data,
    },
    error: null,
  };
};

// Xuất báo cáo thống kê ra file Excel
export const exportStatisticsExcel = async (month, year) => {
  // Lấy tất cả dữ liệu thống kê
  const [
    monthlyRevenueResult,
    summaryResult,
    topMoviesResult,
    topCombosResult,
    topMenuItemsResult,
    genreDistributionResult,
  ] = await Promise.all([
    repo.getMonthlyRevenue(year),
    repo.getStatisticsSummary(month, year),
    repo.getTopMovies(month, year, 10),
    repo.getTopCombos(month, year, 10),
    repo.getTopMenuItems(month, year, 10),
    repo.getGenreDistribution(month, year),
  ]);

  const errors = [
    monthlyRevenueResult.error,
    summaryResult.error,
    topMoviesResult.error,
    topCombosResult.error,
    topMenuItemsResult.error,
    genreDistributionResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    return { data: null, error: errors[0] };
  }

  const wb = XLSX.utils.book_new();

  // --- Sheet 1: Tổng quan ---
  const summaryData = summaryResult.data?.[0];
  const summaryRows = [
    ["BÁO CÁO THỐNG KÊ DOANH THU"],
    [`Tháng ${month} / Năm ${year}`],
    [],
    ["Chỉ số", "Giá trị"],
    ["Tổng doanh thu (VNĐ)", summaryData?.total_revenue || 0],
    ["Tổng vé đã bán", summaryData?.total_tickets || 0],
    ["Tổng đơn hàng", summaryData?.total_orders || 0],
    ["Tổng người dùng", summaryData?.total_users || 0],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary["!cols"] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Tổng Quan");

  // --- Sheet 2: Doanh thu theo tháng ---
  const revenueRows = [
    ["Tháng", "Doanh thu (VNĐ)", "Số vé", "Số đơn hàng"],
    ...(monthlyRevenueResult.data || []).map((r) => [
      `Tháng ${r.month}`,
      r.revenue,
      r.tickets,
      r.orders,
    ]),
  ];
  const wsRevenue = XLSX.utils.aoa_to_sheet(revenueRows);
  wsRevenue["!cols"] = [{ wch: 12 }, { wch: 18 }, { wch: 10 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsRevenue, "Doanh Thu Theo Tháng");

  // --- Sheet 3: Top phim ---
  const movieRows = [
    ["#", "Tên phim", "Doanh thu (VNĐ)", "Số vé", "Đánh giá"],
    ...(topMoviesResult.data || []).map((m, i) => [
      i + 1,
      m.title,
      m.revenue,
      m.tickets,
      m.rating,
    ]),
  ];
  const wsMovies = XLSX.utils.aoa_to_sheet(movieRows);
  wsMovies["!cols"] = [
    { wch: 5 },
    { wch: 30 },
    { wch: 18 },
    { wch: 10 },
    { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(wb, wsMovies, "Top Phim");

  // --- Sheet 4: Top combo ---
  const comboRows = [
    ["#", "Tên combo", "Số lượt bán", "Doanh thu (VNĐ)"],
    ...(topCombosResult.data || []).map((c, i) => [
      i + 1,
      c.name,
      c.sold,
      c.revenue,
    ]),
  ];
  const wsCombos = XLSX.utils.aoa_to_sheet(comboRows);
  wsCombos["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 14 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsCombos, "Top Combo");

  // --- Sheet 5: Top menu items ---
  const menuRows = [
    ["#", "Tên sản phẩm", "Số lượt bán", "Doanh thu (VNĐ)"],
    ...(topMenuItemsResult.data || []).map((m, i) => [
      i + 1,
      m.name,
      m.sold,
      m.revenue,
    ]),
  ];
  const wsMenuItems = XLSX.utils.aoa_to_sheet(menuRows);
  wsMenuItems["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 14 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsMenuItems, "Top Sản Phẩm");

  // --- Sheet 6: Phân bố thể loại ---
  const genreRows = [
    ["Thể loại", "Số phim", "Doanh thu (VNĐ)"],
    ...(genreDistributionResult.data || []).map((g) => [
      g.genre,
      g.count,
      g.revenue,
    ]),
  ];
  const wsGenre = XLSX.utils.aoa_to_sheet(genreRows);
  wsGenre["!cols"] = [{ wch: 20 }, { wch: 10 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsGenre, "Phân Bố Thể Loại");

  // Tạo buffer
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return { data: buffer, error: null };
};
