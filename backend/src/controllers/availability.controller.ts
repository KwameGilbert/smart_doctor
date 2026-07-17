import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import db from "../config/db";
import { AvailabilityModel, DoctorAvailability } from "../models/availability.model";
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

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** "HH:MM" → total minutes since midnight */
function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** Total minutes since midnight → "HH:MM" */
function minutesToTime(total: number): string {
  const h = Math.floor(total / 60).toString().padStart(2, "0");
  const m = (total % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** Check if two [startA, endA) and [startB, endB) windows overlap (in minutes) */
function windowsOverlap(sA: number, eA: number, sB: number, eB: number): boolean {
  return sA < eB && eA > sB;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

function validateTimeSlot(
  dayOfWeek: any,
  startTime: any,
  endTime: any
): string | null {
  if (dayOfWeek === undefined || dayOfWeek === null) return "dayOfWeek is required.";
  const day = Number(dayOfWeek);
  if (!Number.isInteger(day) || day < 0 || day > 6) {
    return "dayOfWeek must be an integer between 0 (Sunday) and 6 (Saturday).";
  }
  if (!startTime || !TIME_REGEX.test(startTime)) {
    return "startTime must be a valid HH:MM 24-hour string.";
  }
  if (!endTime || !TIME_REGEX.test(endTime)) {
    return "endTime must be a valid HH:MM 24-hour string.";
  }
  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    return "endTime must be later than startTime.";
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Doctor self-service endpoints
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /doctors/me/availability
 * Returns the authenticated doctor's full weekly schedule.
 */
export const getMyAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user!.id;
    const schedule = await AvailabilityModel.findWhere({ doctorId });
    const sorted = schedule.sort((a, b) => a.dayOfWeek - b.dayOfWeek || timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    return sendSuccess(res, sorted, "Availability schedule retrieved.");
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /doctors/me/availability
 * Bulk-replace the doctor's entire weekly schedule.
 * Body: { slots: [{ dayOfWeek, startTime, endTime, isAvailable? }] }
 */
export const setAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user!.id;
    const { slots } = req.body;

    if (!Array.isArray(slots) || slots.length === 0) {
      return sendBadRequest(res, "slots must be a non-empty array.");
    }

    // Validate each slot
    for (let i = 0; i < slots.length; i++) {
      const { dayOfWeek, startTime, endTime } = slots[i];
      const err = validateTimeSlot(dayOfWeek, startTime, endTime);
      if (err) return sendBadRequest(res, `Slot ${i}: ${err}`);
    }

    // Clear existing and insert new in one transaction
    await db.transaction(async (trx) => {
      await trx("doctorAvailabilities").where({ doctorId }).del();
      const rows = slots.map((s: any) => ({
        id: crypto.randomUUID(),
        doctorId,
        dayOfWeek: Number(s.dayOfWeek),
        startTime: s.startTime,
        endTime: s.endTime,
        isAvailable: s.isAvailable !== false // default true
      }));
      await trx("doctorAvailabilities").insert(rows);
    });

    const updated = await AvailabilityModel.findWhere({ doctorId });
    return sendSuccess(res, updated, "Availability schedule updated.");
  } catch (err) {
    next(err);
  }
};

/**
 * POST /doctors/me/availability
 * Add a single time slot to the weekly schedule.
 */
export const addAvailabilitySlot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user!.id;
    const { dayOfWeek, startTime, endTime, isAvailable = true } = req.body;

    const validErr = validateTimeSlot(dayOfWeek, startTime, endTime);
    if (validErr) return sendBadRequest(res, validErr);

    // Check for overlap with existing slots on the same day
    const existing = await AvailabilityModel.findWhere({ doctorId, dayOfWeek: Number(dayOfWeek) });
    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(endTime);
    const overlaps = existing.some(s =>
      windowsOverlap(newStart, newEnd, timeToMinutes(s.startTime), timeToMinutes(s.endTime))
    );
    if (overlaps) {
      return sendBadRequest(res, "The new slot overlaps with an existing availability window on the same day.");
    }

    const slot = await AvailabilityModel.create({
      id: crypto.randomUUID(),
      doctorId,
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      isAvailable
    });

    return sendCreated(res, slot, "Availability slot added.");
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /doctors/me/availability/:id
 * Update a specific availability slot.
 */
export const updateAvailabilitySlot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user!.id;
    const { id } = req.params;

    const slot = await AvailabilityModel.findById(id);
    if (!slot || slot.doctorId !== doctorId) {
      return sendNotFound(res, "Availability slot not found.");
    }

    const dayOfWeek = req.body.dayOfWeek !== undefined ? Number(req.body.dayOfWeek) : slot.dayOfWeek;
    const startTime = req.body.startTime ?? slot.startTime;
    const endTime = req.body.endTime ?? slot.endTime;

    const validErr = validateTimeSlot(dayOfWeek, startTime, endTime);
    if (validErr) return sendBadRequest(res, validErr);

    // Overlap check: all other slots on the same day (excluding this one)
    const existing = (await AvailabilityModel.findWhere({ doctorId, dayOfWeek }))
      .filter(s => s.id !== id);
    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(endTime);
    const overlaps = existing.some(s =>
      windowsOverlap(newStart, newEnd, timeToMinutes(s.startTime), timeToMinutes(s.endTime))
    );
    if (overlaps) {
      return sendBadRequest(res, "Updated slot overlaps with an existing availability window.");
    }

    const updates: Partial<DoctorAvailability> = { dayOfWeek, startTime, endTime };
    if (req.body.isAvailable !== undefined) updates.isAvailable = req.body.isAvailable;
    await AvailabilityModel.update(id, updates);

    const updated = await AvailabilityModel.findById(id);
    return sendSuccess(res, updated, "Availability slot updated.");
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /doctors/me/availability/:id
 * Remove a specific availability slot.
 */
export const deleteAvailabilitySlot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user!.id;
    const { id } = req.params;

    const slot = await AvailabilityModel.findById(id);
    if (!slot || slot.doctorId !== doctorId) {
      return sendNotFound(res, "Availability slot not found.");
    }

    await AvailabilityModel.delete(id);
    return sendSuccess(res, null, "Availability slot deleted.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Public endpoints
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /doctors/:id/availability
 * Public – fetch any doctor's weekly schedule.
 */
export const getDoctorAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: doctorId } = req.params;
    const doctor = await DoctorModel.findById(doctorId);
    if (!doctor) return sendNotFound(res, "Doctor not found.");

    const schedule = await AvailabilityModel.findWhere({ doctorId });
    const sorted = schedule.sort((a, b) => a.dayOfWeek - b.dayOfWeek || timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    return sendSuccess(res, sorted, "Doctor availability retrieved.");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /doctors/:id/available-slots?from=YYYY-MM-DD&days=N
 * Public – compute open bookable slots over a date range.
 * Factors in: weekly availability, unavailabilities, existing appointments.
 */
export const getAvailableSlots = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: doctorId } = req.params;
    const { from, days: daysParam } = req.query as { from?: string; days?: string };

    // ── Validate inputs ──────────────────────────────────────────────────────
    if (!from || !/^\d{4}-\d{2}-\d{2}$/.test(from)) {
      return sendBadRequest(res, "Query param `from` must be a YYYY-MM-DD date.");
    }
    const days = Math.min(60, Math.max(1, parseInt(daysParam ?? "7") || 7));

    const doctor = await DoctorModel.findById(doctorId) as any;
    if (!doctor) return sendNotFound(res, "Doctor not found.");

    const slotDuration: number = doctor.slotDurationMinutes ?? 30;

    // ── Fetch all weekly slots for this doctor ───────────────────────────────
    const weeklySlots = await AvailabilityModel.findWhere({ doctorId, isAvailable: true });

    // ── Build the date range ─────────────────────────────────────────────────
    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const results: { date: string; slots: string[] }[] = [];

    for (let i = 0; i < days; i++) {
      const current = new Date(fromDate);
      current.setUTCDate(current.getUTCDate() + i);
      const dateStr = current.toISOString().split("T")[0]; // "YYYY-MM-DD"
      const dow = current.getUTCDay(); // 0=Sun … 6=Sat

      // ── 1. Get availability windows for this weekday ─────────────────────
      const dayWindows = weeklySlots.filter(s => s.dayOfWeek === dow);
      if (dayWindows.length === 0) continue;

      // ── 2. Get unavailabilities for this specific date ───────────────────
      const unavails: any[] = await db("doctorUnavailabilities")
        .where({ doctorId, date: dateStr });

      // Full-day block? (startTime is null = full-day)
      const fullDayBlock = unavails.some(u => u.startTime == null);
      if (fullDayBlock) continue;
      // ── 3. Get existing booked appointments on this date ─────────────────
      const dayStart = `${dateStr}T00:00:00.000Z`;
      const dayEnd   = `${dateStr}T23:59:59.999Z`;
      const bookedAppointments: any[] = await db("appointments")
        .where({ doctorId })
        .whereNotIn("status", ["CANCELLED", "REJECTED"])
        .whereBetween("dateTime", [dayStart, dayEnd])
        .select(db.raw('to_char("dateTime", \'HH24:MI\') as "timeStr"'));

      // ── 4. Generate open slots from each availability window ─────────────
      const dateSlots: string[] = [];

      for (const window of dayWindows) {
        let cursor = timeToMinutes(window.startTime);
        const winEnd = timeToMinutes(window.endTime);

        while (cursor + slotDuration <= winEnd) {
          const slotStart = cursor;
          const slotEnd   = cursor + slotDuration;
          const slotLabel = minutesToTime(slotStart); // "HH:MM"

          // Check against partial unavailabilities
          const blockedByUnavail = unavails.some(u => {
            if (!u.startTime || !u.endTime) return false;
            return windowsOverlap(slotStart, slotEnd, timeToMinutes(u.startTime), timeToMinutes(u.endTime));
          });

          // Check against existing appointments
          const blockedByAppt = bookedAppointments.some(appt => {
            const apptMinutes = timeToMinutes(appt.timeStr);
            return windowsOverlap(slotStart, slotEnd, apptMinutes, apptMinutes + slotDuration);
          });

          if (!blockedByUnavail && !blockedByAppt) {
            dateSlots.push(slotLabel);
          }

          cursor += slotDuration;
        }
      }

      if (dateSlots.length > 0) {
        results.push({ date: dateStr, slots: dateSlots });
      }
    }

    return sendSuccess(res, {
      doctorId,
      slotDurationMinutes: slotDuration,
      from,
      days,
      availability: results
    }, "Available slots computed successfully.");
  } catch (err) {
    next(err);
  }
};
