import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import db from "../config/db";
import { DoctorVerificationModel } from "../models/doctorVerification.model";
import {
  sendSuccess,
  sendBadRequest,
  sendNotFound,
  sendForbidden,
  sendCreated
} from "../helpers/response.helper";
import { sendNotificationTemplate } from "../services/notification.service";

// ─────────────────────────────────────────────────────────────────────────────
// POST /doctor-verifications
// ─────────────────────────────────────────────────────────────────────────────
export const createVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user!.id;
    const { documentType, documentUrl } = req.body;

    if (!documentType || !documentUrl) {
      return sendBadRequest(res, "documentType and documentUrl are required.");
    }

    // Verify user is registered as a DOCTOR
    const doctorExists = await db("doctors").where({ id: doctorId }).first();
    if (!doctorExists) {
      return sendForbidden(res, "Only registered doctors can submit verifications.");
    }

    // Check for existing verifications
    const existing = await DoctorVerificationModel.findWhere({ doctorId });
    const hasPendingOrApproved = existing.some(
      (v) => v.status === "PENDING" || v.status === "APPROVED"
    );

    if (hasPendingOrApproved) {
      const active = existing.find((v) => v.status === "PENDING" || v.status === "APPROVED");
      return sendBadRequest(
        res,
        `You already have an active verification request with status "${active!.status}".`
      );
    }

    const newVerification = {
      id: crypto.randomUUID(),
      doctorId,
      documentType,
      documentUrl,
      status: "PENDING" as const,
      comments: null,
      reviewedById: null,
      reviewedAt: null,
      createdAt: new Date().toISOString()
    };

    await DoctorVerificationModel.create(newVerification);
    return sendCreated(res, newVerification, "Verification document submitted successfully.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /doctor-verifications
// ─────────────────────────────────────────────────────────────────────────────
export const listVerifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { status } = req.query as any;

    const query = db("doctorVerifications")
      .join("users as doctorUser", "doctorVerifications.doctorId", "=", "doctorUser.id")
      .leftJoin("users as adminUser", "doctorVerifications.reviewedById", "=", "adminUser.id")
      .select(
        "doctorVerifications.*",
        "doctorUser.firstName as doctorFirstName",
        "doctorUser.lastName as doctorLastName",
        "adminUser.firstName as adminFirstName",
        "adminUser.lastName as adminLastName"
      );

    if (role === "DOCTOR") {
      query.where("doctorVerifications.doctorId", userId);
    } else if (role !== "ADMIN") {
      return sendForbidden(res, "Access denied.");
    }

    if (status) {
      query.where("doctorVerifications.status", status);
    }

    query.orderBy("doctorVerifications.createdAt", "desc");
    const verifications = await query;

    return sendSuccess(res, verifications, "Doctor verifications retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /doctor-verifications/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getVerificationDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { id } = req.params;

    const verification = await db("doctorVerifications")
      .join("users as doctorUser", "doctorVerifications.doctorId", "=", "doctorUser.id")
      .leftJoin("users as adminUser", "doctorVerifications.reviewedById", "=", "adminUser.id")
      .select(
        "doctorVerifications.*",
        "doctorUser.firstName as doctorFirstName",
        "doctorUser.lastName as doctorLastName",
        "adminUser.firstName as adminFirstName",
        "adminUser.lastName as adminLastName"
      )
      .where("doctorVerifications.id", id)
      .first();

    if (!verification) {
      return sendNotFound(res, "Verification record not found.");
    }

    // Access control
    if (role === "DOCTOR" && verification.doctorId !== userId) {
      return sendForbidden(res, "Access denied. You do not own this verification record.");
    }
    if (role !== "ADMIN" && role !== "DOCTOR") {
      return sendForbidden(res, "Access denied.");
    }

    return sendSuccess(res, verification, "Verification details retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /doctor-verifications/:id/review
// ─────────────────────────────────────────────────────────────────────────────
export const reviewVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user!.id;
    const { id } = req.params;
    const { status, comments } = req.body;

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return sendBadRequest(res, "Valid status ('APPROVED' or 'REJECTED') is required.");
    }

    const verification = await DoctorVerificationModel.findById(id);
    if (!verification) {
      return sendNotFound(res, "Verification record not found.");
    }

    if (verification.status !== "PENDING") {
      return sendBadRequest(res, `Cannot review a verification request with status "${verification.status}".`);
    }

    const now = new Date().toISOString();

    await db.transaction(async (trx) => {
      // 1. Update verification record
      await trx("doctorVerifications")
        .where({ id })
        .update({
          status,
          comments: comments || null,
          reviewedById: adminId,
          reviewedAt: now
        });

      // 2. Update doctor's table status and user's isVerified flag
      if (status === "APPROVED") {
        await trx("doctors")
          .where({ id: verification.doctorId })
          .update({ status: "APPROVED", updatedAt: now });

        await trx("users")
          .where({ id: verification.doctorId })
          .update({ isVerified: true, updatedAt: now });
      } else if (status === "REJECTED") {
        await trx("doctors")
          .where({ id: verification.doctorId })
          .update({ status: "REJECTED", updatedAt: now });

        await trx("users")
          .where({ id: verification.doctorId })
          .update({ isVerified: false, updatedAt: now });
      }
    });

    const updated = await DoctorVerificationModel.findById(id);

    // Notify Doctor of verification review result via template engine
    await sendNotificationTemplate(
      verification.doctorId,
      "VERIFICATION_REVIEWED",
      {
        status: status.toLowerCase(),
        comments: comments ? ` Comments: ${comments}` : ""
      }
    );

    return sendSuccess(res, updated, `Doctor verification reviewed and ${status.toLowerCase()} successfully.`);
  } catch (err) {
    next(err);
  }
};
