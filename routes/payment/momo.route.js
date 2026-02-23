import { Router } from "express";
import * as controller from "../../controllers/payment/momo.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/create", controller.createPayment);

// Redirect URL — browser redirect sang frontend
router.get("/callback", controller.callbackResult);

// IPN URL — server-to-server, MoMo gọi để xác nhận đơn hàng
router.post("/ipn", controller.ipnHandler);

router.post("/refund", controller.refundPayment);

export default router;
