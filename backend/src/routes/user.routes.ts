import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import * as userController from "../controllers/user.controller";

const router = Router();

// Current authenticated user profile retrieval and updates
router.get("/profile", authenticate, userController.getProfile);
router.get("/home", authenticate, userController.getHomeDashboard);
router.get("/doctors", authenticate, userController.getDoctorsDirectory);
router.get("/doctors/:id", authenticate, userController.getDoctorDetail);
router.put("/profile", authenticate, userController.updateProfile);

// Admin-only User Administration endpoints
router.get("/", authenticate, authorize("ADMIN"), userController.listUsers);
router.get("/:id", authenticate, authorize("ADMIN"), userController.getUserById);
router.put("/:id", authenticate, authorize("ADMIN"), userController.updateUserById);
router.delete("/:id", authenticate, authorize("ADMIN"), userController.deleteUserById);
router.patch("/doctors/:id/status", authenticate, authorize("ADMIN"), userController.updateDoctorStatus);

export default router;
