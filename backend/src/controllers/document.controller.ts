import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import db from "../config/db";
import { DocumentModel } from "../models/document.model";
import { logAction } from "../services/audit.service";
import {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendNotFound,
  sendForbidden,
  sendNoContent
} from "../helpers/response.helper";

// ─────────────────────────────────────────────────────────────────────────────
// POST /documents
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Upload a document file and persist its metadata to the database.
 */
export const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    if (!req.file) {
      return sendBadRequest(res, "No file uploaded.");
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const now = new Date().toISOString();

    const document = {
      id: crypto.randomUUID(),
      name: req.body.name || req.file.originalname,
      fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedById: userId,
      createdAt: now
    };

    await DocumentModel.create(document);

    // Audit log
    await logAction(
      userId,
      "DOCUMENT_UPLOADED",
      `Uploaded document "${document.name}" (${req.file.mimetype}, ${req.file.size} bytes)`,
      req.ip
    );

    return sendCreated(res, document, "Document uploaded successfully.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /documents
// ─────────────────────────────────────────────────────────────────────────────

/**
 * List documents scoped by role:
 *   - Patients: see their own uploads
 *   - Doctors: see their own + optionally filter by patient
 *   - Admins: see all, filterable by uploadedById
 */
export const listDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { uploadedById } = req.query as any;

    const query = db("documents")
      .join("users", "documents.uploadedById", "=", "users.id")
      .select(
        "documents.*",
        "users.firstName as uploaderFirstName",
        "users.lastName as uploaderLastName",
        "users.role as uploaderRole"
      );

    if (role === "PATIENT") {
      query.where("documents.uploadedById", userId);
    } else if (role === "DOCTOR") {
      if (uploadedById) {
        query.where("documents.uploadedById", uploadedById);
      } else {
        query.where("documents.uploadedById", userId);
      }
    } else if (role === "ADMIN") {
      if (uploadedById) {
        query.where("documents.uploadedById", uploadedById);
      }
    }

    query.orderBy("documents.createdAt", "desc");
    const documents = await query;

    return sendSuccess(res, documents, "Documents retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /documents/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a single document by ID with access control.
 */
export const getDocumentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { id } = req.params;

    const document = await db("documents")
      .join("users", "documents.uploadedById", "=", "users.id")
      .select(
        "documents.*",
        "users.firstName as uploaderFirstName",
        "users.lastName as uploaderLastName",
        "users.role as uploaderRole"
      )
      .where("documents.id", id)
      .first();

    if (!document) {
      return sendNotFound(res, "Document not found.");
    }

    // Access control: patients can only see their own uploads
    if (role === "PATIENT" && document.uploadedById !== userId) {
      return sendForbidden(res, "Access denied. This is not your document.");
    }

    return sendSuccess(res, document, "Document retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /documents/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Delete a document. Only the uploader or an admin can delete.
 */
export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { id } = req.params;

    const document = await DocumentModel.findById(id);
    if (!document) {
      return sendNotFound(res, "Document not found.");
    }

    // Access control: only the uploader or admin
    if (role !== "ADMIN" && document.uploadedById !== userId) {
      return sendForbidden(res, "Access denied. You do not have permission to delete this document.");
    }

    await DocumentModel.delete(id);

    // Audit log
    await logAction(
      userId,
      "DOCUMENT_DELETED",
      `Deleted document "${document.name}" (ID: ${id})`,
      req.ip
    );

    return sendNoContent(res);
  } catch (err) {
    next(err);
  }
};
