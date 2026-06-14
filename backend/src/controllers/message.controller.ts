import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import db from "../config/db";
import { ConsultationModel } from "../models/consultation.model";
import { AppointmentModel } from "../models/appointment.model";
import { MessageModel } from "../models/message.model";
import { emitToUser } from "../services/socket.service";
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
    const hasContent = content && content.trim().length > 0;
    if (!hasContent && !attachmentUrl) {
      return sendBadRequest(res, "Either message content or an attachment is required.");
    }

    const message = await MessageModel.create({
      id: crypto.randomUUID(),
      consultationId,
      senderId: userId,
      content: hasContent ? content.trim() : null,
      attachmentUrl: attachmentUrl || null,
      attachmentType: attachmentType || null,
      status: "SENT"
    });

    // Fetch sender info to enrich the live WebSocket payload
    const sender = await db("users").where({ id: userId }).first();

    const messagePayload = {
      ...message,
      senderFirstName: sender?.firstName || "",
      senderLastName: sender?.lastName || "",
      senderAvatar: sender?.avatarUrl || null,
      senderRole: sender?.role || "",
      status: "SENT",
      deliveredAt: null,
      readAt: null
    };

    // Emit real-time message event to both participants
    emitToUser(appointment.patientId, "new_message", messagePayload);
    emitToUser(appointment.doctorId, "new_message", messagePayload);

    return sendCreated(res, messagePayload, "Message sent.");
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

// ─────────────────────────────────────────────────────────────────────────────
// POST /consultations/:id/messages/delivered
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mark all messages in a consultation as DELIVERED (sent by the other user).
 */
export const markAllAsDelivered = async (req: Request, res: Response, next: NextFunction) => {
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

    const now = new Date().toISOString();

    await db("messages")
      .where({ consultationId })
      .andWhereNot({ senderId: userId })
      .andWhere({ status: "SENT" })
      .update({
        status: "DELIVERED",
        deliveredAt: now
      });

    // Notify participants via WebSocket
    emitToUser(appointment.patientId, "messages_delivered", { consultationId, deliveredAt: now });
    emitToUser(appointment.doctorId, "messages_delivered", { consultationId, deliveredAt: now });

    return sendSuccess(res, null, "Messages marked as delivered.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /consultations/:id/messages/read
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mark all messages in a consultation as READ (sent by the other user).
 */
export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
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

    const now = new Date().toISOString();

    await db("messages")
      .where({ consultationId })
      .andWhereNot({ senderId: userId })
      .andWhereNot({ status: "READ" })
      .update({
        status: "READ",
        readAt: now,
        deliveredAt: db.raw("COALESCE(deliveredAt, ?)", [now])
      });

    // Notify participants via WebSocket
    emitToUser(appointment.patientId, "messages_read", { consultationId, readAt: now });
    emitToUser(appointment.doctorId, "messages_read", { consultationId, readAt: now });

    return sendSuccess(res, null, "Messages marked as read.");
  } catch (err) {
    next(err);
  }
};
