import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import * as tokenService from "../services/token.service.js";

export const auth = async (req, res, next) => {
  const header =
    req.headers["authorization"] || req.headers["Authorization"] || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // Check 1: Token blacklisted?
    const isBlacklisted = await tokenService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({ 
        success: false, 
        message: "Token has been revoked" 
      });
    }
    
    // Check 2: Token version valid?
    const isVersionValid = await tokenService.isTokenVersionValid(
      decoded.id, 
      decoded.tokenVersion || 1
    );
    if (!isVersionValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Token version invalid. Please login again." 
      });
    }
    
    // Check 3: Token is active session?
    const isActive = await tokenService.isTokenActive(decoded.id, token);
    if (!isActive) {
      return res.status(401).json({ 
        success: false, 
        message: "Session expired. You have been logged in from another device." 
      });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false, 
        message: "Token has expired" 
      });
    }
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
