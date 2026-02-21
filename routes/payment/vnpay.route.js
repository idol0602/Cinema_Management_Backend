import { Router } from "express";
import * as controller from "../../controllers/payment/vnpay.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/create", controller.createPayment);
router.get("/callback", controller.callbackResult);
// VNPAY SANDBOX KHÔNG HỖ TRỢ HOẢN TIỀN
router.post("/refund", controller.refundPayment);
router.post("/callback", controller.handleCallback);

export default router;
