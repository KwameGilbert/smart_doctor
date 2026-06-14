import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import * as prescCtrl from "../controllers/prescription.controller";

const router = Router();

router.post("/", authenticate, authorize("DOCTOR"), prescCtrl.createPrescription);
router.get("/", authenticate, prescCtrl.listPrescriptions);
router.get("/:id", authenticate, prescCtrl.getPrescription);
router.put("/:id", authenticate, authorize("DOCTOR"), prescCtrl.updatePrescription);
router.delete("/:id", authenticate, prescCtrl.deletePrescription);

export default router;
