import * as authorizeService from "../services/authorize.service.js";
import { redisCache } from "../config/redis.js";

export const authorize = () => async (req, res, next) => {
  try {
    const userRole = req.user?.role;
    if (!userRole) {
      return res.status(401).json({ message: "Unauthorized: Bạn cần đăng nhập" });
    }

    // Lấy route khai báo trong hệ thống, VD: /api/movies/:id
    // Các tham số cấu hình tĩnh đều khớp hoàn toàn với dữ liệu trong database
    const requestPath = req.baseUrl + (req.route?.path && req.route?.path !== '/' ? req.route?.path : '');
    const requestMethod = req.method;

    // 1. Dùng Redis Cache để lấy danh sách actions của role
    const cacheKey = `role_actions:${userRole}`;
    let roleActions = await redisCache.get(cacheKey);

    if (roleActions) {
      roleActions = JSON.parse(roleActions); // Chuyển từ JSON string sang mảng Javascript
    } else {
      // 2. Nếu Cache trống, truy vấn Database qua service join 2 bảng
      roleActions = await authorizeService.getAllActionsByRoleId(userRole);
      
      if (!roleActions) roleActions = [];

      // Lưu Cache vào Redis khoảng 30 phút (1800 giây)
      await redis.set(cacheKey, JSON.stringify(roleActions), 'EX', 1800);
    }

    // 3. Kiểm tra quyền
    const hasPermission = roleActions.some(action => 
      action.path === requestPath && action.method === requestMethod
    );

    // 4. Deny-by-default: Không có quyền hợp lệ là chặn luôn
    if (!hasPermission) {
      return res.status(403).json({ message: "Forbidden: Bạn không có quyền sử dụng chức năng này" });
    }

    // Hợp lệ, cho phép qua
    next();
  } catch (error) {
    console.error("Authorization Middleware Error:", error);
    return res.status(500).json({ message: "Lỗi hệ thống kiểm tra quyền" });
  }
};
