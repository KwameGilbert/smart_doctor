import { Request, Response } from "express";

export const uploadSingleFile = (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded."
      });
    }

    // Generate URL to access the uploaded file
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    return res.status(200).json({
      status: "success",
      message: "File uploaded successfully",
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      message: error.message || "File upload failed"
    });
  }
};
