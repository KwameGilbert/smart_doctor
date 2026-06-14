import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import db from "../config/db";
import { MedicalRecordModel } from "../models/medicalRecord.model";
import {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendNotFound,
  sendForbidden,
  sendNoContent
} from "../helpers/response.helper";

// ─────────────────────────────────────────────────────────────────────────────
// POST /medical-records
// ─────────────────────────────────────────────────────────────────────────────
export const createMedicalRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { patientId, recordType, description, attachmentUrl, recordDate } = req.body;

    if (!patientId || !recordType || !recordDate) {
      return sendBadRequest(res, "Missing required fields: patientId, recordType, and recordDate are required.");
    }

    // Check if the patient exists in the patients table
    const patientExists = await db("patients").where({ id: patientId }).first();
    if (!patientExists) {
      return sendNotFound(res, "Patient not found.");
    }

    let doctorId: string | null = null;

    if (role === "PATIENT") {
      // Patients can only create records for themselves
      if (patientId !== userId) {
        return sendForbidden(res, "You can only create medical records for yourself.");
      }
    } else if (role === "DOCTOR") {
      // Doctor role sets the doctorId automatically
      doctorId = userId;
    } else if (role === "ADMIN") {
      // Admin might not have a doctor record, default to null
      doctorId = null;
    }

    const newRecord = {
      id: crypto.randomUUID(),
      patientId,
      doctorId,
      recordType,
      description: description || null,
      attachmentUrl: attachmentUrl || null,
      recordDate: new Date(recordDate).toISOString(),
      createdAt: new Date().toISOString()
    };

    await MedicalRecordModel.create(newRecord);
    return sendCreated(res, newRecord, "Medical record created successfully.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /medical-records
// ─────────────────────────────────────────────────────────────────────────────
export const listMedicalRecords = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { patientId } = req.query as any;

    const query = db("medicalRecords")
      .leftJoin("users as patientUser", "medicalRecords.patientId", "=", "patientUser.id")
      .leftJoin("users as doctorUser", "medicalRecords.doctorId", "=", "doctorUser.id")
      .select(
        "medicalRecords.*",
        "patientUser.firstName as patientFirstName",
        "patientUser.lastName as patientLastName",
        "doctorUser.firstName as doctorFirstName",
        "doctorUser.lastName as doctorLastName"
      );

    if (role === "PATIENT") {
      // Patients can only see their own medical records
      query.where("medicalRecords.patientId", userId);
    } else if (role === "DOCTOR") {
      if (patientId) {
        query.where("medicalRecords.patientId", patientId);
      } else {
        // Return records authored by this doctor by default
        query.where("medicalRecords.doctorId", userId);
      }
    } else if (role === "ADMIN") {
      if (patientId) {
        query.where("medicalRecords.patientId", patientId);
      }
    }

    query.orderBy("medicalRecords.recordDate", "desc");
    const records = await query;

    return sendSuccess(res, records, "Medical records retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /medical-records/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getMedicalRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { id } = req.params;

    const record = await db("medicalRecords")
      .leftJoin("users as patientUser", "medicalRecords.patientId", "=", "patientUser.id")
      .leftJoin("users as doctorUser", "medicalRecords.doctorId", "=", "doctorUser.id")
      .select(
        "medicalRecords.*",
        "patientUser.firstName as patientFirstName",
        "patientUser.lastName as patientLastName",
        "doctorUser.firstName as doctorFirstName",
        "doctorUser.lastName as doctorLastName"
      )
      .where("medicalRecords.id", id)
      .first();

    if (!record) {
      return sendNotFound(res, "Medical record not found.");
    }

    // Access control
    if (role === "PATIENT" && record.patientId !== userId) {
      return sendForbidden(res, "Access denied. This is not your medical record.");
    }

    return sendSuccess(res, record, "Medical record retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /medical-records/:id
// ─────────────────────────────────────────────────────────────────────────────
export const updateMedicalRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { id } = req.params;
    const { recordType, description, attachmentUrl, recordDate } = req.body;

    const record = await MedicalRecordModel.findById(id);
    if (!record) {
      return sendNotFound(res, "Medical record not found.");
    }

    // Access control:
    // - PATIENT: can only update if they own the record AND it has no associated doctor (self-uploaded).
    // - DOCTOR: can only update if they created the record.
    // - ADMIN: can update any.
    if (role === "PATIENT") {
      if (record.patientId !== userId) {
        return sendForbidden(res, "Access denied. You do not own this medical record.");
      }
      if (record.doctorId) {
        return sendForbidden(res, "Access denied. You cannot modify a medical record created by a doctor.");
      }
    } else if (role === "DOCTOR") {
      if (record.doctorId !== userId) {
        return sendForbidden(res, "Access denied. You are not the author of this medical record.");
      }
    }

    const updates: any = {};
    if (recordType !== undefined) updates.recordType = recordType;
    if (description !== undefined) updates.description = description;
    if (attachmentUrl !== undefined) updates.attachmentUrl = attachmentUrl;
    if (recordDate !== undefined) updates.recordDate = new Date(recordDate).toISOString();

    if (Object.keys(updates).length > 0) {
      await MedicalRecordModel.update(id, updates);
    }

    const updatedRecord = await MedicalRecordModel.findById(id);
    return sendSuccess(res, updatedRecord, "Medical record updated successfully.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /medical-records/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deleteMedicalRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { id } = req.params;

    const record = await MedicalRecordModel.findById(id);
    if (!record) {
      return sendNotFound(res, "Medical record not found.");
    }

    // Access control matches update rules
    if (role === "PATIENT") {
      if (record.patientId !== userId) {
        return sendForbidden(res, "Access denied. You do not own this medical record.");
      }
      if (record.doctorId) {
        return sendForbidden(res, "Access denied. You cannot delete a medical record created by a doctor.");
      }
    } else if (role === "DOCTOR") {
      if (record.doctorId !== userId) {
        return sendForbidden(res, "Access denied. You are not the author of this medical record.");
      }
    }

    await MedicalRecordModel.delete(id);
    return sendNoContent(res);
  } catch (err) {
    next(err);
  }
};
