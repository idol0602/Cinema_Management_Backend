import { Router } from "express";
import * as controller from "../../controllers/payment/vnpay.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";

const router = Router();

// Return URL — browser redirect, verify rồi redirect sang frontend
router.get("/callback", controller.callbackResult);

// IPN URL — server-to-server, VNPay gọi để xác nhận đơn hàng  
router.get("/ipn", controller.ipnHandler);

router.post("/create", controller.createPayment);
// VNPAY SANDBOX KHÔNG HỖ TRỢ HOẢN TIỀN
router.post("/refund", controller.refundPayment);

export default router;
