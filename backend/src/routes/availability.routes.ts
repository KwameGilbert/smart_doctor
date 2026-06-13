import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import * as availCtrl from "../controllers/availability.controller";

const router = Router();

// ── Doctor self-service (must come before /:id routes to avoid conflicts) ────
router.get("/me/availability", authenticate, authorize("DOCTOR"), availCtrl.getMyAvailability);
router.put("/me/availability", authenticate, authorize("DOCTOR"), availCtrl.setAvailability);
router.post("/me/availability", authenticate, authorize("DOCTOR"), availCtrl.addAvailabilitySlot);
router.put("/me/availability/:id", authenticate, authorize("DOCTOR"), availCtrl.updateAvailabilitySlot);
router.delete("/me/availability/:id", authenticate, authorize("DOCTOR"), availCtrl.deleteAvailabilitySlot);

// ── Public read ──────────────────────────────────────────────────────────────
router.get("/:id/availability", availCtrl.getDoctorAvailability);
router.get("/:id/available-slots", availCtrl.getAvailableSlots);

export default router;
