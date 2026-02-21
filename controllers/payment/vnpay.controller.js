import * as service from "../../services/payment/vnpay.service.js";

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

export const callbackResult = (req, res) => {
  try {
    const { vnp_ResponseCode, vnp_TxnRef, vnp_TransactionNo, vnp_Amount } =
      req.query;

    const status = service.getPaymentStatus(vnp_ResponseCode);

    return res.status(200).json({
      orderId: vnp_TxnRef,
      resultCode: vnp_ResponseCode,
      status,
      transId: vnp_TransactionNo,
      amount: vnp_Amount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Hoàn tiền VNPay
 * POST /vnpay/refund
 * Body: { orderId, transactionNo, amount, transactionDate, createBy? }
 */
export const refundPayment = async (req, res) => {
  try {
    const { orderId, transactionNo, amount, transactionDate, createBy } = req.body;

    // Validate required fields
    if (!orderId || !transactionNo || !amount || !transactionDate) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: orderId, transactionNo, amount, transactionDate",
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

export const handleCallback = async (req, res) => {
  try {
    const payload = req.body;
    const {data, redirectURL} = await service.handleCallback(payload);
    return res.redirect(redirectURL);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
