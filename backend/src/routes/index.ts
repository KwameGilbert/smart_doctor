import { Router } from "express";
import uploadRouter from "./upload.routes";
import authRouter from "./auth.routes";
import userRouter from "./user.routes";
import adminRouter from "./admin.routes";
import specialtyRouter from "./specialty.routes";
import availabilityRouter from "./availability.routes";
import unavailabilityRouter from "./unavailability.routes";
import appointmentRouter from "./appointment.routes";
import videoSessionRouter from "./videoSession.routes";
import messageRouter from "./message.routes";
import consultationRouter from "./consultation.routes";

const router = Router();

// Health Check / Root
router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Smart Doctor API Gateway"
  });
});

// Health Check
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    timestamp: new Date().toISOString()
  });
});

// Auth Routes
router.use("/auth", authRouter);

// User & Profile Routes
router.use("/users", userRouter);

// Admin Routes
router.use("/admin", adminRouter);

// Upload Routes
router.use("/upload", uploadRouter);

// Specialty Routes
router.use("/specialties", specialtyRouter);

// Doctor Availability & Unavailability Routes
router.use("/doctors", availabilityRouter);
router.use("/doctors", unavailabilityRouter);

// Appointments & Consultations Routes
router.use("/appointments", appointmentRouter);
router.use("/consultations", videoSessionRouter);
router.use("/consultations", messageRouter);
router.use("/consultations", consultationRouter);

export default router;
