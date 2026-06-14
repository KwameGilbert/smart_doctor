import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import * as recordCtrl from "../controllers/medicalRecord.controller";

const router = Router();

router.post("/", authenticate, recordCtrl.createMedicalRecord);
router.get("/", authenticate, recordCtrl.listMedicalRecords);
router.get("/:id", authenticate, recordCtrl.getMedicalRecord);
router.put("/:id", authenticate, recordCtrl.updateMedicalRecord);
router.delete("/:id", authenticate, recordCtrl.deleteMedicalRecord);

export default router;
