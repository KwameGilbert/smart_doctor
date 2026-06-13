import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import * as specialtyController from "../controllers/specialty.controller";

const router = Router();

// Public routes - anyone can browse specialties
router.get("/", specialtyController.listSpecialties);
router.get("/:id", specialtyController.getSpecialtyById);

// Admin-only routes - create, update, delete
router.post("/", authenticate, authorize("ADMIN"), specialtyController.createSpecialty);
router.put("/:id", authenticate, authorize("ADMIN"), specialtyController.updateSpecialty);
router.delete("/:id", authenticate, authorize("ADMIN"), specialtyController.deleteSpecialty);

export default router;
