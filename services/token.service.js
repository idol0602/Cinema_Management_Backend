import jwt from "jsonwebtoken";
import crypto from "crypto";
import { redis } from "../config/redis.js";
import { env } from "../config/env.js";

/**
 * Parse JWT expiry string to seconds
 * @param {string} expiryStr - e.g., "7d", "24h", "60m"
 * @returns {number} seconds
 */
const parseJwtExpiry = (expiryStr) => {
  const match = expiryStr.match(/^(\d+)([smhd])$/);
  if (!match) return 604800; // default 7 days

  const value = parseInt(match[1]);
  const unit = match[2];

  const multipliers = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };

  return value * multipliers[unit];
};

/**
 * Hash token để lưu vào Redis (tránh lưu raw token)
 * @param {string} token
 * @returns {string} hashed token
 */
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Encrypt token để lưu vào session (có thể decrypt lại để blacklist)
 * @param {string} token
 * @returns {string} encrypted token
 */
const encryptToken = (token) => {
  const algorithm = "aes-256-cbc";
  const key = crypto.scryptSync(env.JWT_SECRET, "salt", 32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
};

/**
 * Decrypt token từ session
 * @param {string} encryptedToken
 * @returns {string} original token
 */
const decryptToken = (encryptedToken) => {
  try {
    const algorithm = "aes-256-cbc";
    const key = crypto.scryptSync(env.JWT_SECRET, "salt", 32);

    const parts = encryptedToken.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Error decrypting token:", error);
    return null;
  }
};

/**
 * Lấy token version hiện tại của user
 * @param {string} userId
 * @returns {Promise<number>} version number
 */
export const getTokenVersion = async (userId) => {
  try {
    const version = await redis.get(`token_version:user:${userId}`);
    return version ? parseInt(version) : 1;
  } catch (error) {
    console.error("Error getting token version:", error);
    return 1; // default version
  }
};

/**
 * Tăng token version (khi đổi password)
 * @param {string} userId
 * @returns {Promise<number>} new version
 */
export const incrementTokenVersion = async (userId) => {
  try {
    const newVersion = await redis.incr(`token_version:user:${userId}`);
    return newVersion;
  } catch (error) {
    console.error("Error incrementing token version:", error);
    throw error;
  }
};

/**
 * Generate token với version
 * @param {object} user - user object
 * @returns {Promise<string>} JWT token
 */
export const generateTokenWithVersion = async (user) => {
  const tokenVersion = await getTokenVersion(user.id);

  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
      tokenVersion,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );
};

/**
 * Lưu token vào active session của user
 * @param {string} userId
 * @param {string} token
 * @returns {Promise<void>}
 */
export const saveActiveSession = async (userId, token) => {
  try {
    // Encrypt token trước khi lưu (để có thể decrypt lại khi cần blacklist)
    const encryptedToken = encryptToken(token);
    const ttl = parseJwtExpiry(env.JWT_EXPIRES_IN);

    await redis.setEx(`session:user:${userId}`, ttl, encryptedToken);
  } catch (error) {
    console.error("Error saving active session:", error);
    throw error;
  }
};

/**
 * Lấy active session encrypted token của user
 * @param {string} userId
 * @returns {Promise<string|null>} encrypted token hoặc null
 */
export const getActiveSession = async (userId) => {
  try {
    return await redis.get(`session:user:${userId}`);
  } catch (error) {
    console.error("Error getting active session:", error);
    return null;
  }
};

/**
 * Lấy active session token (decrypted) của user để có thể blacklist
 * @param {string} userId
 * @returns {Promise<string|null>} token hoặc null
 */
export const getActiveSessionToken = async (userId) => {
  try {
    const encryptedToken = await redis.get(`session:user:${userId}`);
    if (!encryptedToken) return null;

    // Check if it's old format (hash) or new format (encrypted)
    // Old format: 64 hex chars (sha256 hash)
    // New format: 32 hex chars (iv) + ':' + encrypted data
    if (!encryptedToken.includes(":")) {
      // Old hash format - can't decrypt, return null
      console.log(
        `Old session format detected for user ${userId}, skipping blacklist`,
      );
      return null;
    }

    const decrypted = decryptToken(encryptedToken);
    if (!decrypted) {
      console.warn(`Failed to decrypt token for user ${userId}`);
      return null;
    }

    return decrypted;
  } catch (error) {
    console.error("Error getting active session token:", error);
    return null;
  }
};

/**
 * Thêm token vào blacklist
 * @param {string} token
 * @returns {Promise<void>}
 */
export const revokeToken = async (token) => {
  try {
    const tokenHash = hashToken(token);

    // Decode để lấy expiry time
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      console.warn("Cannot decode token for blacklist");
      return;
    }

    // TTL = thời gian còn lại của token
    const now = Math.floor(Date.now() / 1000);
    const ttl = decoded.exp - now;

    if (ttl > 0) {
      await redis.setEx(`blacklist:token:${tokenHash}`, ttl, "revoked");
    }
  } catch (error) {
    console.error("Error revoking token:", error);
    // Không throw error để không block flow
  }
};

/**
 * Revoke tất cả token của user (clear session + increment version)
 * @param {string} userId
 * @returns {Promise<void>}
 */
export const revokeAllUserTokens = async (userId) => {
  try {
    // Get current active session token để blacklist
    const activeTokenHash = await getActiveSession(userId);

    // Clear active session
    await redis.del(`session:user:${userId}`);

    // Increment version để invalidate tất cả token cũ
    await incrementTokenVersion(userId);

    console.log(`Revoked all tokens for user ${userId}`);
  } catch (error) {
    console.error("Error revoking all user tokens:", error);
    throw error;
  }
};

/**
 * Kiểm tra token có trong blacklist không
 * @param {string} token
 * @returns {Promise<boolean>}
 */
export const isTokenBlacklisted = async (token) => {
  try {
    const tokenHash = hashToken(token);
    const result = await redis.get(`blacklist:token:${tokenHash}`);
    return result !== null;
  } catch (error) {
    console.error("Error checking token blacklist:", error);
    // Fail-secure: nếu Redis lỗi, coi như token bị blacklist
    return true;
  }
};

/**
 * Kiểm tra token có phải active session của user không
 * @param {string} userId
 * @param {string} token
 * @returns {Promise<boolean>}
 */
export const isTokenActive = async (userId, token) => {
  try {
    const encryptedToken = await getActiveSession(userId);
    if (!encryptedToken) return false;

    // Decrypt to get actual token
    const activeToken = decryptToken(encryptedToken);
    if (!activeToken) {
      // Can't decrypt (might be old format or corrupted)
      // For safety, reject the request
      console.warn(
        `Cannot decrypt active session for user ${userId}, rejecting token`,
      );
      return false;
    }

    return activeToken === token;
  } catch (error) {
    console.error("Error checking active token:", error);
    // Fail-secure: nếu Redis lỗi, coi như không active
    return false;
  }
};

/**
 * Verify token version có hợp lệ không
 * @param {string} userId
 * @param {number} tokenVersion
 * @returns {Promise<boolean>}
 */
export const isTokenVersionValid = async (userId, tokenVersion) => {
  try {
    const currentVersion = await getTokenVersion(userId);
    return tokenVersion === currentVersion;
  } catch (error) {
    console.error("Error checking token version:", error);
    // Fail-secure
    return false;
  }
};



/**
 * Clear active session của user (dùng khi logout)
 * @param {string} userId
 * @returns {Promise<void>}
 */
export const clearActiveSession = async (userId) => {
  try {
    await redis.del(`session:user:${userId}`);
  } catch (error) {
    console.error("Error clearing active session:", error);
    throw error;
  }
};

/**
 * Cookie options cho access token
 * @returns {object} cookie options
 */
export const getCookieOptions = () => {
  const isProduction = env.NODE_ENV === "production";
  const maxAge = parseJwtExpiry(env.JWT_EXPIRES_IN) * 1000; // Convert to milliseconds

  // On Vercel and most production deployments, frontend and backend are on different domains
  // This requires sameSite: "none" and secure: true
  const requiresCrossSiteCookie = isProduction; // Assume cross-site on production

  return {
    httpOnly: true,
    secure: isProduction, // HTTPS required in production
    sameSite: requiresCrossSiteCookie ? "none" : "lax", // "none" allows cross-site, required for Vercel
    maxAge: maxAge,
    path: "/",
  };
};

/**
 * Set token cookie vào response
 * @param {object} res - Express response
 * @param {string} token - JWT token
 */
export const setTokenCookie = (res, token) => {
  const options = getCookieOptions();
  res.cookie("access_token", token, options);
};

/**
 * Clear token cookie từ response
 * @param {object} res - Express response
 */
export const clearTokenCookie = (res) => {
  res.cookie("access_token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 0,
    path: "/",
  });
};
