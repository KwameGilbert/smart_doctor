import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import * as apptCtrl from "../controllers/appointment.controller";

const router = Router();

// Patient books an appointment
router.post("/", authenticate, authorize("PATIENT"), apptCtrl.bookAppointment);

// Patient or Doctor lists their own appointments
router.get("/", authenticate, apptCtrl.listMyAppointments);

// Get single appointment (ownership-checked inside controller)
router.get("/:id", authenticate, apptCtrl.getAppointmentById);

// Doctor confirms / rejects
router.patch("/:id/confirm", authenticate, authorize("DOCTOR"), apptCtrl.confirmAppointment);
router.patch("/:id/reject", authenticate, authorize("DOCTOR"), apptCtrl.rejectAppointment);

// Any authenticated user cancels (ownership-checked inside controller)
router.patch("/:id/cancel", authenticate, apptCtrl.cancelAppointment);
router.patch("/:id/reschedule", authenticate, apptCtrl.rescheduleAppointment);

export default router;
