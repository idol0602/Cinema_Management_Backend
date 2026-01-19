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
  console.log("RETURN URL:", req.query);
  res.send("Payment callback received");
};
