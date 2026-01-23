import * as authorizeService from "../services/authorize.service.js";
import * as actionService from "../services/action.service.js";

export const authorize = (path, method) => async (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.sendStatus(401);
  }
  
  const authorizes = await authorizeService.findByRoleId(req.user.role);
  const action = await actionService.findByPath(path, method);
  
  // Nếu action không tồn tại trong hệ thống -> cho phép truy cập
  if (!action || !action.data) {
    return next()
  }
  
  const actionId = action.data.id;
  
  // Kiểm tra quyền truy cập
  if (authorizes.data && Array.isArray(authorizes.data)) {
    for (const auth of authorizes.data) {
      if (actionId === auth.action_id) {
        return next()
      }
    }
  }
  
  return res.sendStatus(401);
};
