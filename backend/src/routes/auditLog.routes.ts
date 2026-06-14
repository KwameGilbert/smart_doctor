import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { listAuditLogs, getAuditLogById } from "../controllers/auditLog.controller";

const router = Router();

// All audit log routes require admin authentication
router.use(authenticate, authorize("ADMIN"));

router.get("/", listAuditLogs);
router.get("/:id", getAuditLogById);

export default router;
