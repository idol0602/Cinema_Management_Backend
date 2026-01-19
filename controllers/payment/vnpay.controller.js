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
