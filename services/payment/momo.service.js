// Backend/services/payment/momo.service.js
import crypto from "crypto";
import { momoConfig } from "../../config/payment/momo.js";
import { PAYMENT_STATUS } from "../../utils/paymentStatus.js";

const MOMO_RESULT_CODE_MAP = {
  0: "PAID", // Thành công
  1001: "FAILED", // Không đủ tiền
  1003: "EXPIRED", // Timeout auto-cancel
  1005: "EXPIRED", // Link / QR hết hạn
  1006: "CANCELED", // User từ chối thanh toán
};

export const createPayment = async ({ orderId, amount }) => {
  try {
    const accessKey = momoConfig.MOMO_ACCESS_KEY;
    const secretKey = momoConfig.MOMO_SECRET_KEY;
    const partnerCode = momoConfig.MOMO_PARTNER_CODE;
    const requestId = orderId;
    const orderInfo = `Thanh toán đơn hàng ${orderId}`;

    const redirectUrl = momoConfig.MOMO_REDIRECT_URL;
    const ipnUrl = momoConfig.MOMO_IPN_URL;

    const requestType = momoConfig.MOMO_REQUEST_TYPE;

    const extraData = "";
    const autoCapture = true;
    const lang = "vi";

    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode,
      partnerName: "QuanIdol62",
      storeId: "MomoTestStore",

      requestId,
      orderId,
      amount,
      orderInfo,

      redirectUrl,
      ipnUrl,
      requestType,
      autoCapture,
      lang,
      extraData,
      signature,
    };

    // ===== CALL MOMO WITH FETCH =====
    const momoRes = await fetch(momoConfig.MOMO_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const momoData = await momoRes.json();

    return {
      momoData,
      message: "create payment link successfully",
    };
  } catch (error) {
    return {
      momoData: null,
      message: error.message || "create payment link failed",
    };
  }
};

export const getPaymentStatus = (resultCode) => {
  return MOMO_RESULT_CODE_MAP[resultCode] || "FAILED";
};

export const refundPayment = async ({
  orderId,
  transId,
  amount,
  startTime,
  paymentMethod,
  paymentStatus,
}) => {
  try {
    const accessKey = momoConfig.MOMO_ACCESS_KEY;
    const secretKey = momoConfig.MOMO_SECRET_KEY;
    const partnerCode = momoConfig.MOMO_PARTNER_CODE;

    if (!canRefund(startTime, paymentMethod, paymentStatus)) {
      return {
        success: false,
        momoData,
        message:
          "User cannot request a refund because it violates the refund policy",
      };
    }

    const refundOrderId = `${orderId}_REFUND_${Date.now()}`;
    const requestId = `${orderId}_refund_${Date.now()}`;
    const lang = "vi";

    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&description=${"refund for order " + orderId}` +
      `&orderId=${refundOrderId}` +
      `&partnerCode=${partnerCode}` +
      `&requestId=${requestId}` +
      `&transId=${transId}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode,
      orderId: refundOrderId,
      requestId,
      amount,
      transId,
      lang,
      description: "refund for order " + orderId,
      signature,
    };

    const refundEndpoint = momoConfig.MOMO_ENDPOINT.replace(
      "/create",
      "/refund",
    );

    const momoRes = await fetch(refundEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const momoData = await momoRes.json();

    if (momoData.resultCode === 0) {
      return {
        success: true,
        momoData,
        message: "Refund processed successfully",
      };
    } else {
      return {
        success: false,
        momoData,
        message: momoData.message || "Refund failed",
      };
    }
  } catch (error) {
    return {
      success: false,
      momoData: {},
      message: error.message || "Refund request failed",
    };
  }
};

const canRefund = (startTime, paymentMethod, paymentStatus) => {
  const now = new Date();
  const start = new Date(startTime);
  const TWO_HOURS = 2 * 60 * 60 * 100;
  return (
    start.getTime() - now.getTime() >= TWO_HOURS &&
    paymentMethod === "MOMO" &&
    paymentStatus === PAYMENT_STATUS.REFUND_PENDING
  );
};

export const verifyCallback = (query) => {
  try {
    const secretKey = momoConfig.MOMO_SECRET_KEY;
    const { signature, ...rest } = query;

    // To verify MoMo signature, we need to sort keys alphabetically
    // and join them as key=value&key=value (excluding signature)
    const rawSignature = Object.keys(rest)
      .sort()
      .map((key) => `${key}=${rest[key]}`)
      .join("&");

    const generatedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    if (signature !== generatedSignature) {
      console.log("MoMo callback verification failed");
      return { isValid: false };
    }

    const { orderId, resultCode, transId, amount } = query;
    const status = getPaymentStatus(parseInt(resultCode));

    const result = {
      orderId,
      resultCode: parseInt(resultCode),
      status,
      transId,
      amount,
    };

    console.log("MoMo callback data:", result);
    return { isValid: true, ...result };
  } catch (error) {
    console.error("MoMo verification error:", error);
    return { isValid: false, error: error.message };
  }
};
