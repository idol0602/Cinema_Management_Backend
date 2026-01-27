import * as service from "../../services/payment/momo.service.js";

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

export const callbackResult = (req, res) => {
  try {
    const { resultCode, orderId, transId, amount } = req.query;

    const status = service.getPaymentStatus(parseInt(resultCode));

    return res.status(200).json({
      orderId,
      resultCode: parseInt(resultCode),
      status,
      transId,
      amount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const refundPayment = async (req, res) => {
  try {
    const { orderId, transId, amount, startTime, paymentMethod, paymentStatus } = req.body;

    if (!orderId || !transId || !amount || !startTime || !paymentMethod || !paymentStatus) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: orderId, transId, amount, startTime, paymentMethod, paymentStatus",
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
