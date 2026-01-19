import { Router } from "express";
import * as controller from "../../controllers/payment/momo.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/create", controller.createPayment);
router.get("/callback", controller.callbackResult);

export default router;
