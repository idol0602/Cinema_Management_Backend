import { Router } from "express";
import * as controller from "../../controllers/payment/vnpay.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/callback", controller.callbackResult);

router.get("/ipn", controller.ipnHandler);

router.post("/create", controller.createPayment);
// VNPAY SANDBOX KHÔNG HỖ TRỢ HOẢN TIỀN
router.post("/refund", controller.refundPayment);

export default router;
