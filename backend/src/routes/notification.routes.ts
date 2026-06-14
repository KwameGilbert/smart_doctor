import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import * as notifCtrl from "../controllers/notification.controller";

const router = Router();

router.get("/", authenticate, notifCtrl.listMyNotifications);
router.patch("/read-all", authenticate, notifCtrl.markAllAsRead);
router.patch("/:id/read", authenticate, notifCtrl.markAsRead);
router.delete("/:id", authenticate, notifCtrl.deleteNotification);

export default router;
