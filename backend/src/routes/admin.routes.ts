import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import * as adminController from "../controllers/admin.controller";

const router = Router();

// Protect all admin endpoints with global admin authentication/authorization
router.use(authenticate, authorize("ADMIN"));

// Patient administration
router.get("/patients", adminController.listPatients);
router.put("/patients/:id", adminController.updatePatient);

// Doctor administration
router.get("/doctors", adminController.listDoctors);
router.put("/doctors/:id", adminController.updateDoctor);
router.patch("/doctors/:id/status", adminController.updateDoctorStatus);

// User account suspension, activation, and deletion
router.patch("/users/:id/suspend", adminController.suspendUser);
router.patch("/users/:id/activate", adminController.activateUser);
router.delete("/users/:id", adminController.deleteUser);

export default router;
