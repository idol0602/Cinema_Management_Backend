import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { env } from "../config/env.js";
import * as userRepo from "../repositories/user.repo.js";
import { sendMail } from "../utils/mail.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

// actualy dont use in dashboard because admin create user, only login
export const register = async (payload) => {
  const { name, email, phone, password, role } = payload;

  const { data: exists, error: findError } = await userRepo.findByEmail(email);

  if (findError && findError.code !== "PGRST116") {
    return { data: null, error: findError };
  }
  if (exists) {
    const error = new Error("Email already register");
    error.statusCode = 400;
    return { data: null, error };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userToCreate = {
    id: uuid(),
    name,
    email,
    phone,
    password: hashedPassword,
    role: role || "CUSTOMER",
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
  const token = generateToken(data);
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

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error("Invalid email or password");
    err.statusCode = 400;
    return { data: null, error: err };
  }

  const { password: _pw, ...safeUser } = user;
  const token = generateToken(user);

  return {
    data: { user: safeUser, token },
    error: null,
  };
};

export const forgotPassword = async (email) => {
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
    { expiresIn: "15m" }
  );

  const resetLink = `${
    env.CLIENT_URL || process.env.CLIENT_URL
  }/reset-password/${token}`;

  const info = await sendMail({
    to: user.email,
    subject: "Reset mật khẩu",
    html: `
      <p>Bạn yêu cầu đặt lại mật khẩu</p>
      <a href="${resetLink}">Đặt lại mật khẩu</a>
      <p>Link hết hạn sau 15 phút</p>
    `,
  });

  if (info.accepted.length > 0) {
    return {
      success: true,
      message: "Link reset đã được gửi tới email",
    };
  } else {
    return {
      success: false,
      message: "Có lỗi xảy ra",
    };
  }
};

export const resetPassword = async ({ token, newPassword }) => {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (decoded.purpose !== "reset-password") {
    throw new Error("Token không hợp lệ");
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  return await userRepo.changePassword(decoded.userId, hashedPassword);
};
