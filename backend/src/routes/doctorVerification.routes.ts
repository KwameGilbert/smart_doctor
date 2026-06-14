import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import * as verifyCtrl from "../controllers/doctorVerification.controller";

const router = Router();

router.post("/", authenticate, authorize("DOCTOR"), verifyCtrl.createVerification);
router.get("/", authenticate, verifyCtrl.listVerifications);
router.get("/:id", authenticate, verifyCtrl.getVerificationDetails);
router.patch("/:id/review", authenticate, authorize("ADMIN"), verifyCtrl.reviewVerification);

export default router;
