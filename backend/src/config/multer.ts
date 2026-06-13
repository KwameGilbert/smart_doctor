import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure local uploads directory exists for development
const uploadDir = path.join(__dirname, "../../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Image filter (for avatars/profile images)
const imageFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and WEBP images are allowed."), false);
  }
};

// Document filter (for prescriptions, certificates, lab reports)
const documentFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images (JPEG/PNG/WEBP) and documents (PDF/DOC/DOCX) are allowed."), false);
  }
};

// Multer upload instances
export const uploadAvatar = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export const uploadDocument = multer({
  storage: storage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});
