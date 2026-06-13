import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import * as messageCtrl from "../controllers/message.controller";

const router = Router();

// Send a message in a consultation thread (patient or doctor)
router.post("/:id/messages", authenticate, messageCtrl.sendMessage);

// Get paginated messages for a consultation (patient or doctor)
router.get("/:id/messages", authenticate, messageCtrl.getMessages);

export default router;
