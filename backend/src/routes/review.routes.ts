import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import * as reviewCtrl from "../controllers/review.controller";

const router = Router();

router.post("/", authenticate, authorize("PATIENT"), reviewCtrl.createReview);
router.get("/", reviewCtrl.listReviews);
router.get("/:id", reviewCtrl.getReviewDetails);
router.delete("/:id", authenticate, authorize("ADMIN"), reviewCtrl.deleteReview);

export default router;
