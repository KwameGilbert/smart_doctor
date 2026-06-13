import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import * as unavailCtrl from "../controllers/unavailability.controller";

const router = Router();

// ── Doctor self-service ──────────────────────────────────────────────────────
router.get(
  "/me/unavailabilities",
  authenticate, authorize("DOCTOR"),
  unavailCtrl.getMyUnavailabilities
);
router.post(
  "/me/unavailabilities",
  authenticate, authorize("DOCTOR"),
  unavailCtrl.addMyUnavailability
);
router.put(
  "/me/unavailabilities/:id",
  authenticate, authorize("DOCTOR"),
  unavailCtrl.updateMyUnavailability
);
router.delete(
  "/me/unavailabilities/:id",
  authenticate, authorize("DOCTOR"),
  unavailCtrl.deleteMyUnavailability
);

export default router;
