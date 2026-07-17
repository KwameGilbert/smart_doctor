import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import * as consultCtrl from "../controllers/consultation.controller";

const router = Router();

// Get active consultations list for the logged-in user
router.get("/", authenticate, consultCtrl.listMyConsultations);

// Find active consultation by partner ID (doctor ID or patient ID)
router.get("/partner/:partnerId", authenticate, consultCtrl.getConsultationByPartner);

// Get consultation details (ownership-checked inside controller)
router.get("/:id", authenticate, consultCtrl.getConsultation);

// Doctor starts the consultation session
router.patch("/:id/start", authenticate, authorize("DOCTOR"), consultCtrl.startConsultation);

// Doctor ends the consultation session
router.patch("/:id/end", authenticate, authorize("DOCTOR"), consultCtrl.endConsultation);

// Doctor writes/updates notes after session
router.patch("/:id/notes", authenticate, authorize("DOCTOR"), consultCtrl.updateConsultationNotes);

export default router;
