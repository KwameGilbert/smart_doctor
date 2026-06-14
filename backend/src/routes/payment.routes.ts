import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import * as payCtrl from "../controllers/payment.controller";

const router = Router();

router.post("/verify", authenticate, payCtrl.verifyPayment);
router.get("/", authenticate, payCtrl.listPayments);
router.get("/transactions", authenticate, payCtrl.listTransactions);
router.get("/:id", authenticate, payCtrl.getPaymentDetails);

export default router;
