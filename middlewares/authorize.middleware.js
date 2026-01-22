import * as service from "../services/role.service.js";

export const authorize =
  (...roles) =>
  async (req, res, next) => {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const role = await service.findById(req.user.role);
    if (!roles.includes(role.data.name)) {
      return res.sendStatus(403);
    }
    next();
  };
