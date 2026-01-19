import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from "vnpay";
import { vnpayConfig } from "../../config/payment/vnpay.js";

export const createPayment = async ({ orderId, amount }) => {
  try {
    const money = Number(amount);
    const vnpay = new VNPay({
      tmnCode: vnpayConfig.TMN_CODE,
      secureSecret: vnpayConfig.SECURE_SECRET,
      vnpayHost: vnpayConfig.VNPAY_HOST,
      testMode: true,
      hashAlgorithm: "SHA512",
      loggerFn: ignoreLogger,
    });

    const tomrrow = new Date();
    tomrrow.setDate(tomrrow.getDate() + 1);

    const vnpayResponse = await vnpay.buildPaymentUrl({
      vnp_Amount: money,
      vnp_IpAddr: vnpayConfig.VNPAY_IP_ADDRESS,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderId,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: vnpayConfig.VNPAY_RETURN_URL,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomrrow),
    });

    return {
      vnpayData: vnpayResponse,
      message: "create payment link successfully",
    };
  } catch (error) {
    return {
      vnpayData: {},
      message: error.message || "create payment link failed",
    };
  }
};
