import { Router } from "express";
import { uploadAvatar, uploadDocument } from "../config/multer";
import { uploadSingleFile } from "../controllers/upload.controller";

const router = Router();

// Route for profile avatar images (JPEG, PNG, WEBP; max 5MB)
router.post("/avatar", uploadAvatar.single("avatar"), uploadSingleFile);

// Route for documents/reports (Images/PDF/DOC/DOCX; max 10MB)
router.post("/document", uploadDocument.single("document"), uploadSingleFile);

export default router;
