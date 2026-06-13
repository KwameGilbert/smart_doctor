import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import db from "../config/db";
import { ConsultationModel } from "../models/consultation.model";
import { AppointmentModel } from "../models/appointment.model";
import { MessageModel } from "../models/message.model";
import {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendNotFound,
  sendForbidden
} from "../helpers/response.helper";

// ─────────────────────────────────────────────────────────────────────────────
// POST /consultations/:id/messages
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a message in a consultation thread.
 * Both the patient and doctor of the appointment can send.
 */
export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { id: consultationId } = req.params;

    const consultation = await ConsultationModel.findById(consultationId);
    if (!consultation) return sendNotFound(res, "Consultation not found.");

    const appointment = await AppointmentModel.findById(consultation.appointmentId);
    if (!appointment) return sendNotFound(res, "Associated appointment not found.");

    if (role !== "ADMIN" && appointment.patientId !== userId && appointment.doctorId !== userId) {
      return sendForbidden(res, "Access denied.");
    }

    if (!consultation.startedAt) {
      return sendBadRequest(res, "Cannot send messages before the consultation has started.");
    }

    const { content, attachmentUrl, attachmentType } = req.body;
    if (!content || content.trim().length === 0) {
      return sendBadRequest(res, "Message content is required.");
    }

    const message = await MessageModel.create({
      id: crypto.randomUUID(),
      consultationId,
      senderId: userId,
      content: content.trim(),
      attachmentUrl: attachmentUrl || null,
      attachmentType: attachmentType || null
    });

    return sendCreated(res, message, "Message sent.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /consultations/:id/messages
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Paginated message list for a consultation.
 * Supports ?page=1&limit=50, default newest-first.
 */
export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { id: consultationId } = req.params;

    const consultation = await ConsultationModel.findById(consultationId);
    if (!consultation) return sendNotFound(res, "Consultation not found.");

    const appointment = await AppointmentModel.findById(consultation.appointmentId);
    if (!appointment) return sendNotFound(res, "Associated appointment not found.");

    if (role !== "ADMIN" && appointment.patientId !== userId && appointment.doctorId !== userId) {
      return sendForbidden(res, "Access denied.");
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;

    const messages = await db("messages")
      .join("users", "messages.senderId", "=", "users.id")
      .where({ "messages.consultationId": consultationId })
      .select(
        "messages.*",
        "users.firstName as senderFirstName",
        "users.lastName as senderLastName",
        "users.avatarUrl as senderAvatar",
        "users.role as senderRole"
      )
      .orderBy("messages.createdAt", "asc")
      .limit(limit)
      .offset(offset);

    const totalResult = await db("messages")
      .where({ consultationId })
      .count("id as count")
      .first();
    const total = Number((totalResult as any)?.count || 0);

    return sendSuccess(res, {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, "Messages retrieved.");
  } catch (err) {
    next(err);
  }
};
