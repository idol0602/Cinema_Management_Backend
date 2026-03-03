import * as service from "../../services/payment/momo.service.js";
import * as orderService from "../../services/order.service.js";
import { PAYMENT_STATUS } from "../../utils/paymentStatus.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5000";

export const createPayment = async (req, res) => {
  try {
    const { momoData, message } = await service.createPayment(req.body);
    return res.status(201).json({
      message,
      momoData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


/**
 * MoMo Redirect URL callback — chỉ verify rồi redirect user sang frontend
 */
export const callbackResult = (req, res) => {
  try {
    const result = service.verifyCallback(req.query);

    if (!result.isValid) {
      return res.redirect(
        `${CLIENT_URL}/payment/result?status=FAILED&method=MOMO&error=invalid_signature`,
      );
    }

    const params = new URLSearchParams({
      orderId: result.orderId || "",
      status: result.status || "FAILED",
      method: "MOMO",
      transId: String(result.transId || ""),
    });

    return res.redirect(`${CLIENT_URL}/payment/result?${params.toString()}`);
  } catch (error) {
    console.error("MoMo callback error:", error);
    return res.redirect(
      `${CLIENT_URL}/payment/result?status=FAILED&method=MOMO&error=server_error`,
    );
  }
};

/**
 * MoMo IPN handler — server-to-server, verify + xử lý đơn hàng
 */
export const ipnHandler = async (req, res) => {
  try {
    console.log("📥 MoMo IPN received, body:", JSON.stringify(req.body));
    const ipnResult = service.verifyIpn(req.body);

    // Nếu verify thất bại, log nhưng vẫn tiếp tục xử lý
    if (!ipnResult.verified) {
      console.log("⚠️ MoMo IPN verification failed, but still processing order");
    }

    // Gọi handleCallBack để xử lý đơn hàng
    const { data, error } = await orderService.handleCallBack({
      orderId: ipnResult.orderId,
      status: ipnResult.status,
      transId: ipnResult.transId,
      amount: ipnResult.amount,
    });

    if (error) {
      console.error("❌ MoMo IPN handleCallBack error:", error);
      return res.status(204).json(ipnResult.IpnUnknownError);
    }

    console.log(
      "✅ MoMo IPN processed successfully for order:",
      ipnResult.orderId,
    );
    return res.status(204).json(ipnResult.response);
  } catch (error) {
    console.error("MoMo IPN error:", error);
    return res.status(500).json({
      message: "Unknow error",
    });
  }
};

export const refundPayment = async (req, res) => {
  try {
    const {
      orderId,
      transId,
      amount,
      startTime,
      paymentMethod,
      paymentStatus,
    } = req.body;

    console.log("startTime", startTime)

    if (
      !orderId ||
      !transId ||
      !amount ||
      !startTime ||
      !paymentMethod ||
      !paymentStatus
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: orderId, transId, amount, startTime, paymentMethod, paymentStatus",
      });
    }

    const result = await service.refundPayment({
      orderId,
      transId,
      amount: parseInt(amount),
      startTime,
      paymentMethod,
      paymentStatus,
    });

    if (result.success) {
      // Use refund RPC to atomically update order, cancel tickets, release seats, restore stock
      const { data: rpcResult, error: rpcError } = await orderService.refundOrderRpc(orderId);
      
      if (rpcError || !rpcResult?.success) {
        console.error("❌ Refund RPC error:", rpcError || rpcResult?.error);
        return res.status(500).json({
          success: false,
          error: "Refund payment succeeded but failed to update order data",
          details: rpcError?.message || rpcResult?.error,
        });
      }

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.momoData,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
        data: result.momoData,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};
