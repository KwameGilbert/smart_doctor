import { Router } from "express";
import uploadRouter from "./upload.routes";
import authRouter from "./auth.routes";
import userRouter from "./user.routes";
import adminRouter from "./admin.routes";

const router = Router();

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

export default router;
