import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { env } from "../config/env.js";
import * as userRepo from "../repositories/user.repo.js";
import { Producer } from "../rabbitmq/producer.js";
import { TYPE_MAIL } from "../utils/mail.js";
import * as roleService from "../services/role.service.js";
import * as tokenService from "./token.service.js";
import { toVietnamTime } from "../utils/formatTime.js";
import { redis } from "../config/redis.js";

// Deprecated: Use tokenService.generateTokenWithVersion instead
const generateToken = async (user) => {
  return await tokenService.generateTokenWithVersion(user);
};

// actualy dont use in dashboard because admin create user, only login
export const register = async (payload) => {
  const { name, email, phone, password } = payload;

  const { data: exists, error: findError } = await userRepo.findByEmail(email);

  if (findError && findError.code !== "PGRST116") {
    return { data: null, error: findError };
  }
  if (exists) {
    const error = new Error("Email already register");
    error.statusCode = 400;
    return { data: null, error };
  }
  const defaultRole = await roleService.findByName("Customer");
  const hashedPassword = await bcrypt.hash(password, 10);
  const userToCreate = {
    id: uuid(),
    name,
    email,
    phone,
    password: hashedPassword,
    role: defaultRole.data.id,
    is_online: false,
    last_seen: new Date().toISOString(),
    created_at: new Date().toISOString(),
    is_active: true,
  };

  const { data, error } = await userRepo.create(userToCreate);
  if (error) {
    return { data: null, error };
  }

  if (!data) {
    const err = new Error("Failed to create user");
    err.statusCode = 500;
    return { data: null, error: err };
  }

  const { password: _pw, ...safeUser } = data;
  const token = await generateToken(data);

  // Save active session
  await tokenService.saveActiveSession(data.id, token);

  const mailPayload = {
    to: data.email,
    userData: {
      userName: data.name || "Người dùng",
      userEmail: data.email,
      registrationDate: toVietnamTime(data.created_at),
    },
  };

  Producer.mail({
    type: TYPE_MAIL.REGISTRATION_CONFIRMATION,
    payload: mailPayload,
  });
  return {
    data: { user: safeUser, token },
    error: null,
  };
};

export const login = async ({ email, password }) => {
  const { data: user, error } = await userRepo.findByEmail(email);
  if (error && error.code !== "PGRST116") {
    return { data: null, error };
  }

  if (!user) {
    const err = new Error("Invalid email or password");
    err.statusCode = 400;
    return { data: null, error: err };
  }

  const { data: onlineData } = await userRepo.isOnline(user.id);
  if (onlineData && onlineData.length > 0 && onlineData[0].is_online) {
    const err = new Error("Your account is using by another");
    err.statusCode = 400;
    return { data: null, error: err };
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error("Invalid email or password");
    err.statusCode = 400;
    return { data: null, error: err };
  }

  const { password: _pw, ...safeUser } = user;

  // Get old token and blacklist it (logout previous device)
  const oldToken = await tokenService.getActiveSessionToken(user.id);
  if (oldToken) {
    await tokenService.revokeToken(oldToken);
    console.log(
      `Revoked old token for user ${user.id} - logged in from new device`,
    );
  }

  const token = await generateToken(user);

  // Save new active session
  await tokenService.saveActiveSession(user.id, token);

  return {
    data: { user: safeUser, token },
    error: null,
  };
};

export const forgotPassword = async (email,domain) => {
  const { data: user, error } = await userRepo.findByEmail(email);
  if (!user || error) {
    return {
      success: false,
      message: "Nếu email tồn tại, link reset sẽ được gửi",
    };
  }

  const token = jwt.sign(
    { userId: user.id, purpose: "reset-password" },
    env.JWT_SECRET,
    { expiresIn: "15m" },
  );

  const resetLink = `${
    domain || process.env.DASHBOARD_URL
  }/reset-password/${token}`;

  const payload = {
    to: user.email,
    resetData: {
      userName: user.name || "Người dùng",
      userEmail: user.email,
      resetLink: resetLink,
      expirationTime: "15 phút",
    },
  };

  Producer.mail({ type: TYPE_MAIL.FORGOT_PASSWORD, payload });

  return {
    success: true,
    message: "Link reset đã được gửi tới email",
  };
};

export const resetPassword = async ({ token, newPassword }) => {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (decoded.purpose !== "reset-password") {
    throw new Error("Token không hợp lệ");
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Revoke all existing tokens when password is reset
  await tokenService.revokeAllUserTokens(decoded.userId);

  return await userRepo.changePassword(decoded.userId, hashedPassword);
};

export const updateProfile = async ({ userId, payload }) => {
  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const { password, ...updateData } = payload;

  console.log("password", password);

  // Check if password is being changed
  const isPasswordChanged = password !== "";

  // Nếu password là "hidden password" thì không update password, chỉ update những field khác
  const dataToUpdate =
    password === ""
      ? updateData
      : {
          ...payload,
          password: hashedPassword,
        };

  const { data, error } = await userRepo.update(userId, dataToUpdate);

  if (error) {
    return { data: null, error };
  }

  if (!data) {
    const err = new Error("Failed to update user");
    err.statusCode = 500;
    return { data: null, error: err };
  }

  // If password changed, revoke all existing tokens
  if (isPasswordChanged) {
    await tokenService.revokeAllUserTokens(userId);
  }

  // Loại bỏ password trước khi trả về
  const { password: _pw, ...safeUser } = data;
  const token = await generateToken(data);

  // Save new active session
  await tokenService.saveActiveSession(userId, token);

  return {
    data: { user: safeUser, token },
    error: null,
  };
};

export const logout = async (userId, token) => {
  await tokenService.revokeToken(token);
  await tokenService.clearActiveSession(userId);
  return { success: true, message: "Logout successfully" };
};

// ============ OTP Registration ============

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendRegistrationOtp = async (payload) => {
  const { name, email, phone, password } = payload;

  // Check if email already exists
  const { data: exists, error: findError } = await userRepo.findByEmail(email);
  if (findError && findError.code !== "PGRST116") {
    return { data: null, error: findError };
  }
  if (exists) {
    const error = new Error("Email already register");
    error.statusCode = 400;
    return { data: null, error };
  }

  const otp = generateOtp();
  const redisKey = `otp:${email}`;

  // Store OTP + payload in Redis with 10-minute TTL
  await redis.set(
    redisKey,
    JSON.stringify({ otp, payload: { name, email, phone, password } }),
    { EX: 600 }
  );

  // Send OTP email via RabbitMQ
  Producer.mail({
    type: TYPE_MAIL.OTP_VERIFICATION,
    payload: {
      to: email,
      otpData: {
        userName: name || "Người dùng",
        userEmail: email,
        otpCode: otp,
        expirationTime: "10 phút",
      },
    },
  });

  return {
    data: { message: "OTP đã được gửi tới email của bạn" },
    error: null,
  };
};

export const verifyRegistrationOtp = async ({ email, otp }) => {
  const redisKey = `otp:${email}`;
  const stored = await redis.get(redisKey);

  if (!stored) {
    const error = new Error("OTP đã hết hạn hoặc không tồn tại");
    error.statusCode = 400;
    return { data: null, error };
  }

  const { otp: storedOtp, payload } = JSON.parse(stored);

  if (storedOtp !== otp) {
    const error = new Error("Mã OTP không đúng");
    error.statusCode = 400;
    return { data: null, error };
  }

  // OTP valid — delete from Redis and register user
  await redis.del(redisKey);

  // Use existing register logic
  return await register(payload);
};

export const resendRegistrationOtp = async (email) => {
  const redisKey = `otp:${email}`;
  const stored = await redis.get(redisKey);

  if (!stored) {
    const error = new Error("Phiên đăng ký đã hết hạn. Vui lòng đăng ký lại.");
    error.statusCode = 400;
    return { data: null, error };
  }

  const { payload } = JSON.parse(stored);
  const newOtp = generateOtp();

  // Update Redis with new OTP, reset TTL
  await redis.set(
    redisKey,
    JSON.stringify({ otp: newOtp, payload }),
    { EX: 600 }
  );

  // Send new OTP email
  Producer.mail({
    type: TYPE_MAIL.OTP_VERIFICATION,
    payload: {
      to: email,
      otpData: {
        userName: payload.name || "Người dùng",
        userEmail: email,
        otpCode: newOtp,
        expirationTime: "10 phút",
      },
    },
  });

  return {
    data: { message: "Mã OTP mới đã được gửi" },
    error: null,
  };
};
