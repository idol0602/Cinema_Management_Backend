import crypto from "crypto";
import { momoConfig } from "../../config/payment/momo.js";

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
