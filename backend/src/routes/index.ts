import { Router } from "express";
import uploadRouter from "./upload.routes";

const router = Router();

// Base API route placeholder
router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Smart Doctor API Root Router is functional."
  });
});

// Upload Routes
router.use("/upload", uploadRouter);

export default router;
