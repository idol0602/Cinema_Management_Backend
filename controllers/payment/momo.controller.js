// Backend/controllers/payment/momo.controller.js
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
