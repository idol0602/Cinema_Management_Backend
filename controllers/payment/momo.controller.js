import * as service from "../../services/payment/momo.service.js";
import * as orderService from "../../services/order.service.js";

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
    // MoMo IPN gửi qua POST body
    const result = service.verifyCallback(req.body);

    // if (!result.isValid) {
    //   console.log("❌ MoMo IPN verification failed");
    //   return res.status(400).json({ message: "Invalid signature" });
    // }

    // Gọi handleCallBack để xử lý đơn hàng
    const { data, error } = await orderService.handleCallBack({
      orderId: result.orderId,
      status: result.status,
      transId: result.transId,
      amount: result.amount,
    });

    if (error) {
      console.error("❌ MoMo IPN handleCallBack error:", error);
      return res.status(500).json({ message: "Order processing failed" });
    }

    console.log(
      "✅ MoMo IPN processed successfully for order:",
      result.orderId,
    );
    // MoMo yêu cầu trả 204 No Content
    return res.status(204).send();
  } catch (error) {
    console.error("MoMo IPN error:", error);
    return res.status(500).json({ message: "Internal server error" });
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
