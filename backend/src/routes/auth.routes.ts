import { Router } from "express";
import * as authController from "../controllers/auth.controller";

const router = Router();

// Route to register a new patient or doctor
router.post("/register", authController.register);

// Route to verify OTP and activate account
router.post("/verify", authController.verify);

// Route to resend OTP code
router.post("/resend-otp", authController.resend);

// Route to login and receive JWT token
router.post("/login", authController.login);

// Route to request password reset code
router.post("/forgot-password", authController.forgotPassword);

// Route to reset password with code
router.post("/reset-password", authController.resetPassword);

export default router;
