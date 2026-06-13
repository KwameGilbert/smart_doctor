import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import * as videoCtrl from "../controllers/videoSession.controller";

const router = Router();

// Get the video session for a consultation (patient or doctor)
router.get("/:id/video-session", authenticate, videoCtrl.getVideoSession);

// Generate / refresh a video token for a consultation (patient or doctor)
router.post("/:id/video-session/token", authenticate, videoCtrl.generateToken);

export default router;
