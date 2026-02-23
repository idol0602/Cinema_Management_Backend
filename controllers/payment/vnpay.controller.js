import * as service from "../../services/payment/vnpay.service.js";
import * as orderService from "../../services/order.service.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5000";

export const createPayment = async (req, res) => {
  try {
    const { vnpayData, message } = await service.createPayment(req.body);
    return res.status(201).json({
      message,
      vnpayData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * VNPay Return URL callback — chỉ verify rồi redirect user sang frontend
 */
export const callbackResult = (req, res) => {
  try {
    const result = service.verifyCallback(req.query);

    if (!result.isValid) {
      return res.redirect(
        `${CLIENT_URL}/payment/result?status=FAILED&method=VNPAY&error=invalid_signature`,
      );
    }

    const params = new URLSearchParams({
      orderId: result.orderId || "",
      status: result.status || "FAILED",
      method: "VNPAY",
      transId: result.transId || "",
    });

    return res.redirect(`${CLIENT_URL}/payment/result?${params.toString()}`);
  } catch (error) {
    console.error("VNPay callback error:", error);
    return res.redirect(
      `${CLIENT_URL}/payment/result?status=FAILED&method=VNPAY&error=server_error`,
    );
  }
};

/**
 * VNPay IPN handler — server-to-server, verify + xử lý đơn hàng + trả response cho VNPay
 */
export const ipnHandler = async (req, res) => {
  try {
    const ipnResult = service.verifyIpn(req.query);

    // Nếu verify thất bại, trả response lỗi cho VNPay
    // if (!ipnResult.verified) {
    //   console.log("❌ VNPay IPN verification failed");
    //   return res.json(ipnResult.response);
    // }

    // Gọi handleCallBack để xử lý đơn hàng
    const { data, error } = await orderService.handleCallBack({
      orderId: ipnResult.orderId,
      status: ipnResult.status,
      transId: ipnResult.transId,
      amount: ipnResult.amount,
    });

    if (error) {
      console.error("❌ VNPay IPN handleCallBack error:", error);
      return res.json(ipnResult.IpnUnknownError);
    }

    console.log(
      "✅ VNPay IPN processed successfully for order:",
      ipnResult.orderId,
    );
    return res.json(ipnResult.response);
  } catch (error) {
    console.error("VNPay IPN error:", error);
    return res.json({
      RspCode: "99",
      Message: "Unknow error",
    });
  }
};

/**
 * Hoàn tiền VNPay
 * POST /vnpay/refund
 * Body: { orderId, transactionNo, amount, transactionDate, createBy? }
 */
export const refundPayment = async (req, res) => {
  try {
    const { orderId, transactionNo, amount, transactionDate, createBy } =
      req.body;

    // Validate required fields
    if (!orderId || !transactionNo || !amount || !transactionDate) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: orderId, transactionNo, amount, transactionDate",
      });
    }

    const result = await service.refundPayment({
      orderId,
      transactionNo,
      amount: parseInt(amount),
      transactionDate,
      createBy: createBy || "Admin",
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.vnpayData,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
        data: result.vnpayData,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};
