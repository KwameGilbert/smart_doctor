import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { uploadDocument as uploadDocumentMiddleware } from "../config/multer";
import {
  uploadDocument,
  listDocuments,
  getDocumentById,
  deleteDocument
} from "../controllers/document.controller";

const router = Router();

// All document routes require authentication
router.use(authenticate);

router.post("/", uploadDocumentMiddleware.single("document"), uploadDocument);
router.get("/", listDocuments);
router.get("/:id", getDocumentById);
router.delete("/:id", deleteDocument);

export default router;
