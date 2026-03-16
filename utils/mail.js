import nodemailer from "nodemailer";
import mjml2html from "mjml";
import Handlebars from "handlebars";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parseBoolean = (value, defaultValue) => {
  if (value === undefined || value === null || value === "")
    return defaultValue;
  return String(value).toLowerCase() === "true";
};

const smtpHost = env.MAIL_HOST || "smtp.gmail.com";
const smtpPort = Number(env.MAIL_PORT) || 587;
const smtpSecure = parseBoolean(env.MAIL_SECURE, smtpPort === 465);
const smtpAuth = {
  user: env.MAIL_USER,
  pass: String(env.MAIL_PASS || "").replace(/\s+/g, ""),
};

const fromEmail = env.MAIL_FROM_EMAIL || env.MAIL_USER;

const buildTransportOptions = ({ host, port, secure }) => ({
  host,
  port,
  secure,
  requireTLS: !secure,
  auth: smtpAuth,
  connectionTimeout: Number(env.MAIL_CONNECTION_TIMEOUT || 15000),
  greetingTimeout: Number(env.MAIL_GREETING_TIMEOUT || 10000),
  socketTimeout: Number(env.MAIL_SOCKET_TIMEOUT || 20000),
});

const getFallbackConfigs = () => {
  const configs = [{ host: smtpHost, port: smtpPort, secure: smtpSecure }];

  // Gmail on cloud providers can work on 465 even if 587 times out.
  if (smtpHost === "smtp.gmail.com") {
    if (!(smtpPort === 465 && smtpSecure)) {
      configs.push({ host: smtpHost, port: 465, secure: true });
    }
    if (!(smtpPort === 587 && !smtpSecure)) {
      configs.push({ host: smtpHost, port: 587, secure: false });
    }
  }

  return configs;
};

const sendWithBrevoApi = async ({ to, subject, html, from }) => {
  if (!env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: from,
        email: fromEmail,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Brevo API failed (${response.status}): ${errorBody}`);
  }

  return await response.json();
};
/**
 * Load and compile MJML template with data
 * @param {string} templateName - Name of the MJML template file (without extension)
 * @param {object} data - Data to inject into the template
 * @returns {Promise<string>} Compiled HTML
 */
const compileTemplate = async (templateName, data) => {
  try {
    const templatePath = path.join(
      __dirname,
      "mailTemplate",
      `${templateName}.mjml`,
    );
    const mjmlContent = await fs.readFile(templatePath, "utf-8");

    // Add logo URL to data
    const baseUrl = env.DASHBOARD_URL;
    const dataWithLogo = {
      ...data,
      logoUrl: `${baseUrl}/logo.png`, // Assuming static files served from /public
    };

    // Compile with Handlebars first to inject dynamic data
    const template = Handlebars.compile(mjmlContent);
    const mjmlWithData = template(dataWithLogo);

    // Convert MJML to HTML
    const { html, errors } = mjml2html(mjmlWithData, {
      validationLevel: "soft",
    });

    if (errors && errors.length > 0) {
      console.warn("MJML compilation warnings:", errors);
    }

    return html;
  } catch (error) {
    console.error(`Error compiling template ${templateName}:`, error);
    throw error;
  }
};

/**
 * Base function to send email
 * @param {object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.from] - Custom sender name (optional)
 * @returns {Promise<object>} Nodemailer info object
 */
export const sendMail = async ({ to, subject, html, from = "META CINEMA" }) => {
  let lastError = null;

  // In cloud environments, SMTP ports are often blocked or unstable.
  // If Brevo API key exists, use HTTPS API first to avoid SMTP timeouts.
  if (env.BREVO_API_KEY) {
    try {
      const result = await sendWithBrevoApi({ to, subject, html, from });
      console.log("[Mail] Delivery via Brevo API succeeded");
      return result;
    } catch (apiError) {
      console.error("[Mail] Brevo API delivery failed, fallback to SMTP", {
        message: apiError?.message,
      });
      lastError = apiError;
    }
  }

  const transportConfigs = getFallbackConfigs();

  for (let i = 0; i < transportConfigs.length; i++) {
    const config = transportConfigs[i];
    const transporter = nodemailer.createTransport(
      buildTransportOptions(config),
    );

    try {
      const info = await transporter.sendMail({
        from: `"${from}" <${fromEmail}>`,
        to,
        subject,
        html,
      });
      return info;
    } catch (error) {
      lastError = error;
      console.error(
        `[Mail] SMTP attempt ${i + 1}/${transportConfigs.length} failed (${config.host}:${config.port}, secure=${config.secure})`,
        {
          code: error?.code,
          command: error?.command,
          message: error?.message,
        },
      );
    }
  }

  throw lastError;
};

/**
 * Send order confirmation email with ticket list and QR codes
 * @param {object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {object} options.orderData - Order data including tickets, movie info, etc.
 * @returns {Promise<object>} Nodemailer info object
 */
export const sendOrderConfirmation = async ({ to, orderData }) => {
  const html = await compileTemplate("orderConfirmation", orderData);
  return sendMail({
    to,
    subject: `Xác Nhận Đơn Hàng #${orderData.orderId} - META CINEMA`,
    html,
    from: "META CINEMA - ĐẶT VÉ",
  });
};

/**
 * Send password reset email
 * @param {object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {object} options.resetData - Reset data including user info, reset link, expiration time
 * @returns {Promise<object>} Nodemailer info object
 */
export const sendPasswordReset = async ({ to, resetData }) => {
  const html = await compileTemplate("passwordReset", resetData);
  return sendMail({
    to,
    subject: "Đặt Lại Mật Khẩu - META CINEMA",
    html,
    from: "META CINEMA - BẢO MẬT",
  });
};

/**
 * Send registration confirmation email
 * @param {object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {object} options.userData - User data including name, email, verification link (if needed)
 * @returns {Promise<object>} Nodemailer info object
 */
export const sendRegistrationConfirmation = async ({ to, userData }) => {
  const html = await compileTemplate("registrationConfirmation", userData);
  return sendMail({
    to,
    subject: "Chào Mừng Đến Với META CINEMA!",
    html,
    from: "META CINEMA - TÀI KHOẢN",
  });
};

/**
 * Send OTP verification email
 */
export const sendOtpEmail = async ({ to, otpData }) => {
  const html = await compileTemplate("otpVerification", otpData);
  return sendMail({
    to,
    subject: `Mã OTP Xác Thực - META CINEMA`,
    html,
    from: "META CINEMA - BẢO MẬT",
  });
};

export const TYPE_MAIL = {
  ORDER_CONFIRMATION: "orderConfirmation",
  PASSWORD_RESET: "passwordReset",
  FORGOT_PASSWORD: "forgotPassword",
  REGISTRATION_CONFIRMATION: "registrationConfirmation",
  OTP_VERIFICATION: "otpVerification",
};

export const handleSendMail = async (type, payload) => {
  try {
    switch (type) {
      case TYPE_MAIL.ORDER_CONFIRMATION:
        await sendOrderConfirmation(payload);
        break;
      case TYPE_MAIL.PASSWORD_RESET:
        await sendPasswordReset(payload);
        break;
      case TYPE_MAIL.FORGOT_PASSWORD:
        await sendPasswordReset(payload);
        break;
      case TYPE_MAIL.REGISTRATION_CONFIRMATION:
        await sendRegistrationConfirmation(payload);
        break;
      case TYPE_MAIL.OTP_VERIFICATION:
        await sendOtpEmail(payload);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("Error sending mail:", error);
  }
};
