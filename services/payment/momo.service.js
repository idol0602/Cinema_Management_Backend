// Backend/services/payment/momo.service.js
import crypto from "crypto";
import { momoConfig } from "../../config/payment/momo.js";

const MOMO_RESULT_CODE_MAP = {
  0: "PAID", // Thành công
  1001: "FAILED", // Không đủ tiền
  1003: "EXPIRED", // Timeout auto-cancel
  1005: "EXPIRED", // Link / QR hết hạn
  1006: "CANCELLED", // User từ chối thanh toán
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
      momoData: {},
      message: error.message || "create payment link failed",
    };
  }
};

export const getPaymentStatus = (resultCode) => {
  return MOMO_RESULT_CODE_MAP[resultCode] || "FAILED";
};

export const refundPayment = async ({ orderId, transId, amount, description = "" }) => {
  try {
    const accessKey = momoConfig.MOMO_ACCESS_KEY;
    const secretKey = momoConfig.MOMO_SECRET_KEY;
    const partnerCode = momoConfig.MOMO_PARTNER_CODE;
    
    // OrderId cho refund PHẢI là mã MỚI, không được trùng với orderId gốc
    const refundOrderId = `${orderId}_REFUND_${Date.now()}`;
    // RequestId phải unique cho mỗi lần refund
    const requestId = `${orderId}_refund_${Date.now()}`;
    const lang = "vi";

    // Signature cho refund API - dùng refundOrderId thay vì orderId gốc
    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&description=${description}` +
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
      orderId: refundOrderId,  // Dùng refundOrderId
      requestId,
      amount,
      transId,
      lang,
      description,
      signature,
    };

    // MoMo Refund API endpoint (same base, different path)
    const refundEndpoint = momoConfig.MOMO_ENDPOINT.replace("/create", "/refund");

    const momoRes = await fetch(refundEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const momoData = await momoRes.json();

    // resultCode = 0 means success
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
