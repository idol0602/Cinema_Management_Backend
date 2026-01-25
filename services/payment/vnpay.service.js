import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from "vnpay";
import { vnpayConfig } from "../../config/payment/vnpay.js";

const VNPAY_RESULT_CODE_MAP = {
  "00": "PAID", // Giao dịch thành công
  11: "EXPIRED", // Hết hạn chờ thanh toán
  24: "CANCELLED", // User hủy giao dịch
  51: "FAILED", // Không đủ số dư
  65: "FAILED", // Vượt hạn mức
};

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

export const getPaymentStatus = (resultCode) => {
  return VNPAY_RESULT_CODE_MAP[resultCode] || "FAILED";
};

/**
 * Hoàn tiền VNPay
 * @param {Object} params
 * @param {string} params.orderId - Mã đơn hàng gốc (vnp_TxnRef)
 * @param {string} params.transactionNo - Mã giao dịch VNPay (vnp_TransactionNo từ callback)
 * @param {number} params.amount - Số tiền hoàn
 * @param {string} params.transactionDate - Ngày giao dịch gốc (vnp_PayDate format: yyyyMMddHHmmss)
 * @param {string} params.createBy - Người tạo yêu cầu hoàn tiền
 */
export const refundPayment = async ({
  orderId,
  transactionNo,
  amount,
  transactionDate,
  createBy = "Admin",
}) => {
  try {
    const vnpay = new VNPay({
      tmnCode: vnpayConfig.TMN_CODE,
      secureSecret: vnpayConfig.SECURE_SECRET,
      vnpayHost: vnpayConfig.VNPAY_HOST,
      testMode: true,
      hashAlgorithm: "SHA512",
      loggerFn: ignoreLogger,
    });

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
