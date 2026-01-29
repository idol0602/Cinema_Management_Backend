import { supabase } from "../config/supabase.js";

// Thống kê doanh thu theo tháng trong năm
export const getMonthlyRevenue = async (year) => {
  return await supabase.rpc("get_monthly_revenue", { p_year: year });
};

// Thống kê tổng quan theo tháng/năm
export const getStatisticsSummary = async (month, year) => {
  return await supabase.rpc("get_statistics_summary", { 
    p_month: month, 
    p_year: year 
  });
};

// Top phim doanh thu cao nhất
export const getTopMovies = async (month, year, limit = 5) => {
  return await supabase.rpc("get_top_movies", { 
    p_month: month, 
    p_year: year,
    p_limit: limit 
  });
};

// Top Combo bán chạy
export const getTopCombos = async (month, year, limit = 5) => {
  return await supabase.rpc("get_top_combos", { 
    p_month: month, 
    p_year: year,
    p_limit: limit 
  });
};

// Top Menu Items bán chạy
export const getTopMenuItems = async (month, year, limit = 6) => {
  return await supabase.rpc("get_top_menu_items", { 
    p_month: month, 
    p_year: year,
    p_limit: limit 
  });
};

// Phân bố thể loại phim
export const getGenreDistribution = async (month, year) => {
  return await supabase.rpc("get_genre_distribution", { 
    p_month: month, 
    p_year: year 
  });
};
