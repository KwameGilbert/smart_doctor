import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { UnavailabilityModel } from "../models/unavailability.model";
import { DoctorModel } from "../models/doctor.model";
import {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendNotFound
} from "../helpers/response.helper";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function validateUnavailabilityBody(body: any): string | null {
  const { date, startTime, endTime } = body;

  if (!date || !DATE_REGEX.test(date)) {
    return "date must be a valid YYYY-MM-DD string.";
  }

  // Both must be provided together or both absent (full-day)
  if ((startTime && !endTime) || (!startTime && endTime)) {
    return "Both startTime and endTime must be provided together, or both omitted (full-day block).";
  }

  if (startTime && !TIME_REGEX.test(startTime)) {
    return "startTime must be a valid HH:MM 24-hour string.";
  }
  if (endTime && !TIME_REGEX.test(endTime)) {
    return "endTime must be a valid HH:MM 24-hour string.";
  }
  if (startTime && endTime && timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    return "endTime must be later than startTime.";
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Doctor self-service endpoints
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /doctors/me/unavailabilities
 * Doctor lists their own blocked dates/times.
 */
export const getMyUnavailabilities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user!.id;
    const blocks = await UnavailabilityModel.findWhere({ doctorId });
    return sendSuccess(res, blocks, "Unavailabilities retrieved.");
  } catch (err) {
    next(err);
  }
};

/**
 * POST /doctors/me/unavailabilities
 * Doctor blocks a date (full-day or partial).
 */
export const addMyUnavailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user!.id;
    const err = validateUnavailabilityBody(req.body);
    if (err) return sendBadRequest(res, err);

    const { date, startTime = null, endTime = null, reason = null } = req.body;

    const block = await UnavailabilityModel.create({
      id: crypto.randomUUID(),
      doctorId,
      date,
      startTime,
      endTime,
      reason
    });

    return sendCreated(res, block, "Unavailability block added.");
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /doctors/me/unavailabilities/:id
 * Doctor updates a specific block.
 */
export const updateMyUnavailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user!.id;
    const { id } = req.params;

    const block = await UnavailabilityModel.findById(id);
    if (!block || block.doctorId !== doctorId) {
      return sendNotFound(res, "Unavailability block not found.");
    }

    // Merge with existing values for validation
    const merged = {
      date: req.body.date ?? block.date,
      startTime: req.body.startTime !== undefined ? req.body.startTime : block.startTime,
      endTime: req.body.endTime !== undefined ? req.body.endTime : block.endTime
    };
    const err = validateUnavailabilityBody(merged);
    if (err) return sendBadRequest(res, err);

    const updates: any = {};
    if (req.body.date !== undefined) updates.date = req.body.date;
    if (req.body.startTime !== undefined) updates.startTime = req.body.startTime ?? null;
    if (req.body.endTime !== undefined) updates.endTime = req.body.endTime ?? null;
    if (req.body.reason !== undefined) updates.reason = req.body.reason ?? null;

    await UnavailabilityModel.update(id, updates);
    const updated = await UnavailabilityModel.findById(id);
    return sendSuccess(res, updated, "Unavailability block updated.");
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /doctors/me/unavailabilities/:id
 * Doctor removes a specific block.
 */
export const deleteMyUnavailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user!.id;
    const { id } = req.params;

    const block = await UnavailabilityModel.findById(id);
    if (!block || block.doctorId !== doctorId) {
      return sendNotFound(res, "Unavailability block not found.");
    }

    await UnavailabilityModel.delete(id);
    return sendSuccess(res, null, "Unavailability block deleted.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin endpoints
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /admin/doctors/:id/unavailabilities
 * Admin views any doctor's blocked dates/times.
 */
export const getDoctorUnavailabilities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: doctorId } = req.params;
    const doctor = await DoctorModel.findById(doctorId);
    if (!doctor) return sendNotFound(res, "Doctor not found.");

    const blocks = await UnavailabilityModel.findWhere({ doctorId });
    return sendSuccess(res, blocks, "Doctor unavailabilities retrieved.");
  } catch (err) {
    next(err);
  }
};

/**
 * POST /admin/doctors/:id/unavailabilities
 * Admin blocks a date on behalf of a doctor.
 */
export const addDoctorUnavailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: doctorId } = req.params;
    const doctor = await DoctorModel.findById(doctorId);
    if (!doctor) return sendNotFound(res, "Doctor not found.");

    const err = validateUnavailabilityBody(req.body);
    if (err) return sendBadRequest(res, err);

    const { date, startTime = null, endTime = null, reason = null } = req.body;

    const block = await UnavailabilityModel.create({
      id: crypto.randomUUID(),
      doctorId,
      date,
      startTime,
      endTime,
      reason
    });

    return sendCreated(res, block, "Unavailability block added by admin.");
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /admin/doctors/:id/unavailabilities/:unavailId
 * Admin removes a specific block from a doctor.
 */
export const deleteDoctorUnavailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: doctorId, unavailId } = req.params;

    const block = await UnavailabilityModel.findById(unavailId);
    if (!block || block.doctorId !== doctorId) {
      return sendNotFound(res, "Unavailability block not found.");
    }

    await UnavailabilityModel.delete(unavailId);
    return sendSuccess(res, null, "Unavailability block deleted.");
  } catch (err) {
    next(err);
  }
};
