import {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  dateFormat,
  IpnFailChecksum,
  IpnOrderNotFound,
  IpnInvalidAmount,
  InpOrderAlreadyConfirmed,
  IpnUnknownError,
  IpnSuccess,
} from "vnpay";
import { vnpayConfig } from "../../config/payment/vnpay.js";

const VNPAY_RESULT_CODE_MAP = {
  "00": "PAID", // Giao dịch thành công
  11: "EXPIRED", // Hết hạn chờ thanh toán
  24: "CANCELED", // User hủy giao dịch
  51: "FAILED", // Không đủ số dư
  65: "FAILED", // Vượt hạn mức
};

const createVnpayInstance = () =>
  new VNPay({
    tmnCode: vnpayConfig.TMN_CODE,
    secureSecret: vnpayConfig.SECURE_SECRET,
    vnpayHost: vnpayConfig.VNPAY_HOST,
    testMode: true,
    hashAlgorithm: "SHA512",
    loggerFn: ignoreLogger,
  });

export const createPayment = async ({ orderId, amount }) => {
  try {
    const money = Number(amount);
    const vnpay = createVnpayInstance();

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
      vnpayData: null,
      message: error.message || "create payment link failed",
    };
  }
};

export const getPaymentStatus = (resultCode) => {
  return VNPAY_RESULT_CODE_MAP[resultCode] || "FAILED";
};

export const refundPayment = async ({
  orderId,
  transactionNo,
  amount,
  transactionDate,
  createBy = "Admin",
}) => {
  try {
    const vnpay = createVnpayInstance();

    const refundResponse = await vnpay.refund({
      vnp_Amount: Number(amount),
      vnp_CreateBy: createBy,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_IpAddr: vnpayConfig.VNPAY_IP_ADDRESS,
      vnp_OrderInfo: `Hoan tien don hang ${orderId}`,
      vnp_RequestId: `${orderId}_REFUND_${Date.now()}`,
      vnp_TransactionDate: transactionDate,
      vnp_TransactionNo: Number(transactionNo),
      vnp_TransactionType: "02", // 02 = Hoàn tiền toàn phần, 03 = Hoàn tiền một phần
      vnp_TxnRef: orderId,
    });

    // vnp_ResponseCode = "00" means success
    if (refundResponse.vnp_ResponseCode === "00") {
      return {
        success: true,
        vnpayData: refundResponse,
        message: "Refund processed successfully",
      };
    } else {
      return {
        success: false,
        vnpayData: refundResponse,
        message: refundResponse.vnp_Message || "Refund failed",
      };
    }
  } catch (error) {
    return {
      success: false,
      vnpayData: {},
      message: error.message || "Refund request failed",
    };
  }
};

/**
 * Verify return URL callback (browser redirect) — chỉ verify, dùng để redirect frontend
 */
export const verifyCallback = (query) => {
  try {
    const vnpay = createVnpayInstance();

    const isValid = vnpay.verifyReturnUrl(query);
    if (!isValid) {
      console.log("VNPay callback verification failed");
      return { isValid: false };
    }

    const orderId = query.vnp_TxnRef;
    const resultCode = query.vnp_ResponseCode;
    const transId = query.vnp_TransactionNo;
    const amount = query.vnp_Amount;
    const status = getPaymentStatus(resultCode);

    const result = {
      orderId,
      resultCode,
      status,
      transId,
      amount,
    };

    console.log("VNPay callback data:", result);
    return { isValid: true, ...result };
  } catch (error) {
    console.error("VNPay verification error:", error);
    return { isValid: false, error: error.message };
  }
};

/**
 * Verify IPN call (server-to-server) — verify + trả response cho VNPay
 */
export const verifyIpn = (query) => {
  try {
    const vnpay = createVnpayInstance();
    const verify = vnpay.verifyIpnCall(query);

    if (!verify.isVerified) {
      console.log("VNPay IPN checksum verification failed");
    }

    if (!verify.isSuccess) {
      console.log("VNPay IPN transaction not successful");
    }

    const orderId = query.vnp_TxnRef;
    const resultCode = query.vnp_ResponseCode;
    const transId = query.vnp_TransactionNo;
    const amount = verify.vnp_Amount;
    const status = getPaymentStatus(resultCode);

    console.log("VNPay IPN verified:", { orderId, status, transId, amount });

    return {
      verified: verify.isSuccess && verify.isVerified,
      orderId,
      resultCode,
      status,
      transId,
      amount,
      response: IpnSuccess,
      // Export response constants cho controller dùng khi cần
      IpnOrderNotFound,
      IpnInvalidAmount,
      InpOrderAlreadyConfirmed,
      IpnUnknownError,
    };
  } catch (error) {
    console.error("VNPay IPN verification error:", error);
    return { verified: false, response: IpnUnknownError };
  }
};
