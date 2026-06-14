import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import db from "../config/db";
import { PrescriptionModel } from "../models/prescription.model";
import { sendNotificationTemplate } from "../services/notification.service";
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
// POST /prescriptions
// ─────────────────────────────────────────────────────────────────────────────
export const createPrescription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user!.id;
    const { patientId, consultationId, notes, items } = req.body;

    if (!patientId || !items || !Array.isArray(items) || items.length === 0) {
      return sendBadRequest(res, "Missing required fields: patientId and a non-empty items array are required.");
    }

    // Verify patient exists
    const patientExists = await db("patients").where({ id: patientId }).first();
    if (!patientExists) {
      return sendNotFound(res, "Patient not found.");
    }

    // Verify consultation exists if provided
    if (consultationId) {
      const consultationExists = await db("consultations").where({ id: consultationId }).first();
      if (!consultationExists) {
        return sendNotFound(res, "Consultation not found.");
      }
    }

    // Validate items
    for (const item of items) {
      if (!item.medication || !item.dosage || !item.frequency || !item.duration) {
        return sendBadRequest(
          res,
          "Each prescription item must have medication, dosage, frequency, and duration."
        );
      }
    }

    const prescriptionId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newPrescription = {
      id: prescriptionId,
      consultationId: consultationId || null,
      patientId,
      doctorId,
      notes: notes || null,
      createdAt: now,
      updatedAt: now
    };

    const newItems = items.map((item: any) => ({
      id: crypto.randomUUID(),
      prescriptionId,
      medication: item.medication,
      dosage: item.dosage,
      frequency: item.frequency,
      duration: item.duration,
      instructions: item.instructions || null
    }));

    await db.transaction(async (trx) => {
      await trx("prescriptions").insert(newPrescription);
      await trx("prescriptionItems").insert(newItems);
    });

    // Notify patient via template engine
    const doctorUser = await db("users").where({ id: doctorId }).first();
    if (doctorUser) {
      const doctorName = `${doctorUser.firstName} ${doctorUser.lastName}`;
      await sendNotificationTemplate(patientId, "PRESCRIPTION_CREATED", { doctorName });
    }
    // Log action to audit logs
    await logAction(doctorId, "PRESCRIPTION_CREATED", `Created prescription ID: ${prescriptionId} for patient ID: ${patientId}`, req.ip);
    return sendCreated(
      res,
      { ...newPrescription, items: newItems },
      "Prescription created successfully."
    );
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /prescriptions
// ─────────────────────────────────────────────────────────────────────────────
export const listPrescriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { patientId, consultationId } = req.query as any;

    const query = db("prescriptions")
      .join("users as patientUser", "prescriptions.patientId", "=", "patientUser.id")
      .join("users as doctorUser", "prescriptions.doctorId", "=", "doctorUser.id")
      .select(
        "prescriptions.*",
        "patientUser.firstName as patientFirstName",
        "patientUser.lastName as patientLastName",
        "doctorUser.firstName as doctorFirstName",
        "doctorUser.lastName as doctorLastName"
      );

    if (role === "PATIENT") {
      query.where("prescriptions.patientId", userId);
    } else if (role === "DOCTOR") {
      if (patientId) {
        query.where("prescriptions.patientId", patientId);
      } else {
        // Default to prescriptions written by this doctor
        query.where("prescriptions.doctorId", userId);
      }
    } else if (role === "ADMIN") {
      if (patientId) {
        query.where("prescriptions.patientId", patientId);
      }
    }

    if (consultationId) {
      query.where("prescriptions.consultationId", consultationId);
    }

    query.orderBy("prescriptions.createdAt", "desc");
    const prescriptions = await query;

    if (prescriptions.length > 0) {
      const prescriptionIds = prescriptions.map((p) => p.id);
      const items = await db("prescriptionItems").whereIn("prescriptionId", prescriptionIds);

      prescriptions.forEach((p) => {
        p.items = items.filter((item) => item.prescriptionId === p.id);
      });
    }

    return sendSuccess(res, prescriptions, "Prescriptions retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /prescriptions/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getPrescription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { id } = req.params;

    const prescription = await db("prescriptions")
      .join("users as patientUser", "prescriptions.patientId", "=", "patientUser.id")
      .join("users as doctorUser", "prescriptions.doctorId", "=", "doctorUser.id")
      .select(
        "prescriptions.*",
        "patientUser.firstName as patientFirstName",
        "patientUser.lastName as patientLastName",
        "doctorUser.firstName as doctorFirstName",
        "doctorUser.lastName as doctorLastName"
      )
      .where("prescriptions.id", id)
      .first();

    if (!prescription) {
      return sendNotFound(res, "Prescription not found.");
    }

    // Access control
    if (role === "PATIENT" && prescription.patientId !== userId) {
      return sendForbidden(res, "Access denied. This is not your prescription.");
    }

    const items = await db("prescriptionItems").where({ prescriptionId: id });
    prescription.items = items;

    return sendSuccess(res, prescription, "Prescription retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /prescriptions/:id
// ─────────────────────────────────────────────────────────────────────────────
export const updatePrescription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user!.id;
    const { id } = req.params;
    const { notes, items } = req.body;

    const prescription = await PrescriptionModel.findById(id);
    if (!prescription) {
      return sendNotFound(res, "Prescription not found.");
    }

    if (prescription.doctorId !== doctorId) {
      return sendForbidden(res, "Access denied. You are not the author of this prescription.");
    }

    // Validate new items if provided
    if (items) {
      if (!Array.isArray(items)) {
        return sendBadRequest(res, "Items must be an array.");
      }
      for (const item of items) {
        if (!item.medication || !item.dosage || !item.frequency || !item.duration) {
          return sendBadRequest(
            res,
            "Each prescription item must have medication, dosage, frequency, and duration."
          );
        }
      }
    }

    const now = new Date().toISOString();

    await db.transaction(async (trx) => {
      // Update notes & updatedAt
      const updates: any = { updatedAt: now };
      if (notes !== undefined) updates.notes = notes;
      await trx("prescriptions").where({ id }).update(updates);

      // If items provided, replace them
      if (items) {
        await trx("prescriptionItems").where({ prescriptionId: id }).del();
        const newItems = items.map((item: any) => ({
          id: crypto.randomUUID(),
          prescriptionId: id,
          medication: item.medication,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions || null
        }));
        if (newItems.length > 0) {
          await trx("prescriptionItems").insert(newItems);
        }
      }
    });

    const updated = await PrescriptionModel.findById(id);
    const updatedItems = await db("prescriptionItems").where({ prescriptionId: id });

    // Notify patient about the prescription update
    const doctorUser = await db("users").where({ id: doctorId }).first();
    if (doctorUser && updated) {
      const doctorName = `${doctorUser.firstName} ${doctorUser.lastName}`;
      await sendNotificationTemplate(updated.patientId, "PRESCRIPTION_UPDATED", { doctorName });
    }
    // Log action to audit logs
    await logAction(doctorId, "PRESCRIPTION_UPDATED", `Updated prescription ID: ${id} for patient ID: ${prescription.patientId}`, req.ip);
    return sendSuccess(
      res,
      { ...updated, items: updatedItems },
      "Prescription updated successfully."
    );
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /prescriptions/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deletePrescription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { id } = req.params;

    const prescription = await PrescriptionModel.findById(id);
    if (!prescription) {
      return sendNotFound(res, "Prescription not found.");
    }

    // Access control: only the prescribing doctor or admin can delete
    if (role !== "ADMIN" && prescription.doctorId !== userId) {
      return sendForbidden(res, "Access denied. You do not have permission to delete this prescription.");
    }

    await PrescriptionModel.delete(id);

    // Log action to audit logs
    await logAction(userId, "PRESCRIPTION_DELETED", `Deleted prescription ID: ${id} (Role: ${role})`, req.ip);

    return sendNoContent(res);
  } catch (err) {
    next(err);
  }
};
