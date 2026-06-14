import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { ConsultationModel } from "../models/consultation.model";
import { AppointmentModel } from "../models/appointment.model";
import { VideoSessionModel } from "../models/videoSession.model";
import { generateAgoraToken } from "../services/agora.service";
import {
  sendSuccess,
  sendBadRequest,
  sendNotFound,
  sendForbidden
} from "../helpers/response.helper";

// ─────────────────────────────────────────────────────────────────────────────
// GET /consultations/:id/video-session
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the video session (channel name + token) for a consultation.
 * Only accessible to the patient and doctor of that consultation.
 */
export const getVideoSession = async (req: Request, res: Response, next: NextFunction) => {
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

    const videoSession = await VideoSessionModel.findOne({ consultationId });
    if (!videoSession) {
      return sendNotFound(res, "Video session has not been created yet. The doctor must start the consultation first.");
    }

    return sendSuccess(res, videoSession, "Video session retrieved.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /consultations/:id/video-session/token
// ─────────────────────────────────────────────────────────────────────────────

/**
 * (Re-)generate a video session token.
 * In production, this would generate an Agora/Twilio RTC token.
 * Stub: if AGORA_APP_ID + AGORA_APP_CERTIFICATE are not set, returns a dev placeholder.
 */
export const generateToken = async (req: Request, res: Response, next: NextFunction) => {
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

    const videoSession = await VideoSessionModel.findOne({ consultationId });
    if (!videoSession) {
      return sendNotFound(res, "Video session not created yet. The doctor must start the consultation first.");
    }

    if (videoSession.status === "ENDED") {
      return sendBadRequest(res, "This video session has already ended.");
    }

    // Attempt to generate a real token, fall back to dev stub
    let token: string;
    const appId = process.env.AGORA_APP_ID;
    const appCert = process.env.AGORA_APP_CERTIFICATE;

    if (appId && appCert) {
      token = generateAgoraToken(videoSession.channelName);
      console.log(`[Video] Generated Agora token for channel: ${videoSession.channelName}`);
    } else {
      token = `dev-token-${crypto.randomUUID().slice(0, 12)}`;
      console.log(`[Video] AGORA credentials not configured. Using dev token for channel: ${videoSession.channelName}`);
    }

    await VideoSessionModel.update(videoSession.id, { token });

    return sendSuccess(res, {
      channelName: videoSession.channelName,
      token,
      status: videoSession.status
    }, "Video token generated.");
  } catch (err) {
    next(err);
  }
};
