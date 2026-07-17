import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import db from "../config/db";
import { ConsultationModel } from "../models/consultation.model";
import { AppointmentModel } from "../models/appointment.model";
import { VideoSessionModel } from "../models/videoSession.model";
import {
  sendSuccess,
  sendBadRequest,
  sendNotFound,
  sendForbidden
} from "../helpers/response.helper";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verify the caller is either the patient or doctor for the consultation's appointment.
 * Returns the appointment if authorized, or sends a forbidden/not-found response.
 */
async function authorizeConsultationAccess(
  consultationId: string,
  userId: string,
  role: string,
  res: Response
): Promise<{ consultation: any; appointment: any } | null> {
  const consultation = await ConsultationModel.findById(consultationId);
  if (!consultation) {
    sendNotFound(res, "Consultation not found.");
    return null;
  }

  const appointment = await AppointmentModel.findById(consultation.appointmentId);
  if (!appointment) {
    sendNotFound(res, "Associated appointment not found.");
    return null;
  }

  if (role !== "ADMIN" && appointment.patientId !== userId && appointment.doctorId !== userId) {
    sendForbidden(res, "Access denied.");
    return null;
  }

  return { consultation, appointment };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /consultations/:id
// ─────────────────────────────────────────────────────────────────────────────

export const getConsultation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { id } = req.params;

    const ctx = await authorizeConsultationAccess(id, userId, role, res);
    if (!ctx) return;

    const { consultation, appointment } = ctx;

    // Attach related data
    const videoSession = await VideoSessionModel.findOne({ consultationId: id });
    const messageCount = await db("messages").where({ consultationId: id }).count("id as count").first();

    // Fetch patient/doctor user info
    const [patient, doctor] = await Promise.all([
      db("users").where({ id: appointment.patientId })
        .select("id", "firstName", "lastName", "avatarUrl", "email")
        .first(),
      db("users").where({ id: appointment.doctorId })
        .select("id", "firstName", "lastName", "avatarUrl", "email")
        .first()
    ]);

    return sendSuccess(res, {
      ...consultation,
      appointment: {
        id: appointment.id,
        dateTime: appointment.dateTime,
        status: appointment.status,
        reason: appointment.reason
      },
      patient,
      doctor,
      videoSession: videoSession || null,
      messageCount: Number((messageCount as any)?.count || 0)
    }, "Consultation retrieved.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /consultations/:id/start
// ─────────────────────────────────────────────────────────────────────────────

export const startConsultation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user!.id;
    const { id } = req.params;

    const consultation = await ConsultationModel.findById(id);
    if (!consultation) return sendNotFound(res, "Consultation not found.");

    const appointment = await AppointmentModel.findById(consultation.appointmentId);
    if (!appointment || appointment.doctorId !== doctorId) {
      return sendForbidden(res, "Not your consultation.");
    }

    if (consultation.startedAt) {
      return sendBadRequest(res, "Consultation has already been started.");
    }

    const now = new Date().toISOString();
    const channelName = `sd-${id.slice(0, 8)}-${Date.now()}`;

    await db.transaction(async (trx) => {
      await trx("consultations").where({ id }).update({ startedAt: now, updatedAt: now });
      await trx("videoSessions").insert({
        id: crypto.randomUUID(),
        consultationId: id,
        channelName,
        token: null,
        status: "ACTIVE",
        startedAt: now
      });
    });

    const updated = await ConsultationModel.findById(id);
    const videoSession = await VideoSessionModel.findOne({ consultationId: id });

    return sendSuccess(res, { ...updated, videoSession }, "Consultation started. Video session created.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /consultations/:id/end
// ─────────────────────────────────────────────────────────────────────────────

export const endConsultation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user!.id;
    const { id } = req.params;

    const consultation = await ConsultationModel.findById(id);
    if (!consultation) return sendNotFound(res, "Consultation not found.");

    const appointment = await AppointmentModel.findById(consultation.appointmentId);
    if (!appointment || appointment.doctorId !== doctorId) {
      return sendForbidden(res, "Not your consultation.");
    }

    if (!consultation.startedAt) {
      return sendBadRequest(res, "Cannot end a consultation that has not been started.");
    }
    if (consultation.endedAt) {
      return sendBadRequest(res, "Consultation has already ended.");
    }

    const now = new Date().toISOString();

    await db.transaction(async (trx) => {
      // End consultation
      await trx("consultations").where({ id }).update({ endedAt: now, updatedAt: now });
      // End video session
      await trx("videoSessions").where({ consultationId: id }).update({ status: "ENDED", endedAt: now });
      // Mark appointment as COMPLETED
      await trx("appointments").where({ id: appointment.id }).update({ status: "COMPLETED", updatedAt: now });
    });

    const updated = await ConsultationModel.findById(id);
    return sendSuccess(res, updated, "Consultation ended. Appointment completed.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /consultations/:id/notes
// ─────────────────────────────────────────────────────────────────────────────

export const updateConsultationNotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user!.id;
    const { id } = req.params;

    const consultation = await ConsultationModel.findById(id);
    if (!consultation) return sendNotFound(res, "Consultation not found.");

    const appointment = await AppointmentModel.findById(consultation.appointmentId);
    if (!appointment || appointment.doctorId !== doctorId) {
      return sendForbidden(res, "Not your consultation.");
    }

    if (!consultation.startedAt) {
      return sendBadRequest(res, "Cannot write notes before the consultation has started.");
    }

    const { diagnosis, notes, recommendations } = req.body;
    const updates: any = { updatedAt: new Date().toISOString() };
    if (diagnosis !== undefined) updates.diagnosis = diagnosis;
    if (notes !== undefined) updates.notes = notes;
    if (recommendations !== undefined) updates.recommendations = recommendations;

    await ConsultationModel.update(id, updates);
    const updated = await ConsultationModel.findById(id);
    return sendSuccess(res, updated, "Consultation notes updated.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin: List All Consultations
// ─────────────────────────────────────────────────────────────────────────────

export const listAllConsultations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { doctorId, patientId, status } = req.query as any;

    const query = db("consultations")
      .join("appointments", "consultations.appointmentId", "=", "appointments.id")
      .join("users as patientUser", "appointments.patientId", "=", "patientUser.id")
      .join("users as doctorUser", "appointments.doctorId", "=", "doctorUser.id")
      .select(
        "consultations.*",
        "appointments.dateTime",
        "appointments.status as appointmentStatus",
        "patientUser.firstName as patientFirstName",
        "patientUser.lastName as patientLastName",
        "doctorUser.firstName as doctorFirstName",
        "doctorUser.lastName as doctorLastName"
      );

    if (doctorId) query.where("appointments.doctorId", doctorId);
    if (patientId) query.where("appointments.patientId", patientId);
    if (status === "IN_PROGRESS") {
      query.whereNotNull("consultations.startedAt").whereNull("consultations.endedAt");
    } else if (status === "COMPLETED") {
      query.whereNotNull("consultations.endedAt");
    } else if (status === "NOT_STARTED") {
      query.whereNull("consultations.startedAt");
    }

    query.orderBy("consultations.createdAt", "desc");

    const consultations = await query;
    return sendSuccess(res, consultations, "All consultations retrieved.");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /consultations
 * List active consultations/chats for the currently logged in patient or doctor, enriched with last message and unread count.
 */
export const listMyConsultations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    const query = db("consultations")
      .join("appointments", "consultations.appointmentId", "=", "appointments.id")
      .join("users as patientUser", "appointments.patientId", "=", "patientUser.id")
      .join("users as doctorUser", "appointments.doctorId", "=", "doctorUser.id")
      .leftJoin("doctors as doctorProfile", "doctorUser.id", "=", "doctorProfile.userId")
      .select(
        "consultations.*",
        "appointments.dateTime",
        "appointments.status as appointmentStatus",
        "patientUser.id as patientId",
        "patientUser.firstName as patientFirstName",
        "patientUser.lastName as patientLastName",
        "patientUser.avatarUrl as patientAvatar",
        "doctorUser.id as doctorId",
        "doctorUser.firstName as doctorFirstName",
        "doctorUser.lastName as doctorLastName",
        "doctorUser.avatarUrl as doctorAvatar",
        "doctorProfile.specialty as doctorSpecialty"
      );

    if (role === "PATIENT") {
      query.where("appointments.patientId", userId);
    } else if (role === "DOCTOR") {
      query.where("appointments.doctorId", userId);
    }

    query.orderBy("consultations.createdAt", "desc");

    const consultations = await query;

    // Fetch the last message and unread count for each consultation thread
    const consultationsWithLastMsg = await Promise.all(
      consultations.map(async (c) => {
        const lastMessage = await db("messages")
          .where({ consultationId: c.id })
          .orderBy("createdAt", "desc")
          .first();

        const unreadCount = await db("messages")
          .where({ consultationId: c.id, isRead: false })
          .whereNot({ senderId: userId })
          .count("id as count")
          .first();

        return {
          ...c,
          lastMessage: lastMessage || null,
          unreadCount: Number((unreadCount as any)?.count || 0)
        };
      })
    );

    return sendSuccess(res, consultationsWithLastMsg, "My consultations retrieved.");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /consultations/partner/:partnerId
 * Find the latest active consultation thread between the logged-in user and a partner (doctor or patient).
 * If an appointment exists but no consultation has been created yet, auto-create one.
 */
export const getConsultationByPartner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { partnerId } = req.params;

    let consultation = await db("consultations")
      .join("appointments", "consultations.appointmentId", "=", "appointments.id")
      .select("consultations.*")
      .where(function () {
        this.where("appointments.patientId", userId).where("appointments.doctorId", partnerId);
      })
      .orWhere(function () {
        this.where("appointments.patientId", partnerId).where("appointments.doctorId", userId);
      })
      .orderBy("consultations.createdAt", "desc")
      .first();

    // If no consultation found, check if an appointment exists and auto-create one
    if (!consultation) {
      const appointment = await db("appointments")
        .where(function () {
          this.where("patientId", userId).where("doctorId", partnerId);
        })
        .orWhere(function () {
          this.where("patientId", partnerId).where("doctorId", userId);
        })
        .whereNotIn("status", ["CANCELLED", "REJECTED"])
        .orderBy("createdAt", "desc")
        .first();

      if (!appointment) {
        return sendNotFound(res, "No appointment found with this partner.");
      }

      // Auto-create the consultation for this appointment
      const now = new Date().toISOString();
      const newId = crypto.randomUUID();
      await db("consultations").insert({
        id: newId,
        appointmentId: appointment.id,
        createdAt: now,
        updatedAt: now,
      });

      consultation = await db("consultations").where({ id: newId }).first();
    }

    return sendSuccess(res, consultation, "Consultation found.");
  } catch (err) {
    next(err);
  }
};

