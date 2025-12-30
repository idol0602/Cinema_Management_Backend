import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const auth = (req, res, next) => {
  const header =
    req.headers["authorization"] || req.headers["Authorization"] || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
