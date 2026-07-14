import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import db from "../config/db";
import { AppointmentModel } from "../models/appointment.model";
import { DoctorModel } from "../models/doctor.model";
import { ConsultationModel } from "../models/consultation.model";
import { AvailabilityModel } from "../models/availability.model";
import { initializeTransaction } from "../services/paystack.service";
import { sendNotificationTemplate } from "../services/notification.service";
import { logAction } from "../services/audit.service";
import {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendNotFound,
  sendForbidden
} from "../helpers/response.helper";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function windowsOverlap(sA: number, eA: number, sB: number, eB: number): boolean {
  return sA < eB && eA > sB;
}

// ─────────────────────────────────────────────────────────────────────────────
// Patient: Book Appointment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /appointments
 * Patient books an appointment at a specific dateTime with a doctor.
 */
export const bookAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patientId = req.user!.id;
    const { doctorId, dateTime, reason } = req.body;

    if (!doctorId || !dateTime) {
      return sendBadRequest(res, "doctorId and dateTime are required.");
    }

    // 1. Doctor must exist and be APPROVED
    const doctor = await DoctorModel.findById(doctorId) as any;
    if (!doctor) return sendNotFound(res, "Doctor not found.");
    if (doctor.status !== "APPROVED") {
      return sendBadRequest(res, "This doctor is not currently accepting appointments.");
    }

    // 2. dateTime must be in the future
    const apptDate = new Date(dateTime);
    if (isNaN(apptDate.getTime())) {
      return sendBadRequest(res, "dateTime must be a valid ISO date string.");
    }
    if (apptDate.getTime() <= Date.now()) {
      return sendBadRequest(res, "Cannot book an appointment in the past.");
    }

    // 3. Check availability window for that weekday
    const dayOfWeek = apptDate.getUTCDay();
    const slotDuration: number = doctor.slotDurationMinutes ?? 30;
    const apptMinutes = apptDate.getUTCHours() * 60 + apptDate.getUTCMinutes();

    const availWindows = await AvailabilityModel.findWhere({ doctorId, dayOfWeek, isAvailable: true });
    const insideWindow = availWindows.some(w => {
      const wStart = timeToMinutes(w.startTime);
      const wEnd = timeToMinutes(w.endTime);
      return apptMinutes >= wStart && (apptMinutes + slotDuration) <= wEnd;
    });
    if (!insideWindow) {
      return sendBadRequest(res, "The requested time is outside the doctor's availability window.");
    }

    // 4. Check unavailabilities for that specific date
    const dateStr = apptDate.toISOString().split("T")[0];
    const unavails: any[] = await db("doctorUnavailabilities")
      .where({ doctorId, date: dateStr });

    const fullDayBlock = unavails.some((u: any) => u.startTime == null);
    if (fullDayBlock) {
      return sendBadRequest(res, "The doctor is unavailable on this date.");
    }

    const partialBlock = unavails.some((u: any) => {
      if (!u.startTime || !u.endTime) return false;
      return windowsOverlap(
        apptMinutes, apptMinutes + slotDuration,
        timeToMinutes(u.startTime), timeToMinutes(u.endTime)
      );
    });
    if (partialBlock) {
      return sendBadRequest(res, "The doctor is unavailable during this time slot.");
    }

    // 5. No existing appointment occupies this slot for the doctor
    const dayStart = `${dateStr}T00:00:00.000Z`;
    const dayEnd = `${dateStr}T23:59:59.999Z`;

    const doctorConflict = await db("appointments")
      .where({ doctorId })
      .whereIn("status", ["PENDING", "CONFIRMED"])
      .whereBetween("dateTime", [dayStart, dayEnd])
      .then((appts: any[]) => appts.some(a => {
        const existingMinutes = new Date(a.dateTime).getUTCHours() * 60 + new Date(a.dateTime).getUTCMinutes();
        return windowsOverlap(apptMinutes, apptMinutes + slotDuration, existingMinutes, existingMinutes + slotDuration);
      }));
    if (doctorConflict) {
      return sendBadRequest(res, "This time slot is already booked for this doctor.");
    }

    // 6. Patient has no overlapping appointment
    const patientConflict = await db("appointments")
      .where({ patientId })
      .whereIn("status", ["PENDING", "CONFIRMED"])
      .whereBetween("dateTime", [dayStart, dayEnd])
      .then((appts: any[]) => appts.some(a => {
        const existingMinutes = new Date(a.dateTime).getUTCHours() * 60 + new Date(a.dateTime).getUTCMinutes();
        return windowsOverlap(apptMinutes, apptMinutes + slotDuration, existingMinutes, existingMinutes + slotDuration);
      }));
    if (patientConflict) {
      return sendBadRequest(res, "You already have an appointment at this time.");
    }

    // All checks passed — create the appointment & pending payment atomically
    const appointmentId = crypto.randomUUID();
    const paymentId = crypto.randomUUID();
    const reference = `PAY-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
    const amount = parseFloat(doctor.consultationFee);
    const now = new Date().toISOString();

    const appointment = {
      id: appointmentId,
      patientId,
      doctorId,
      dateTime: apptDate.toISOString(),
      status: "PENDING" as const,
      reason: reason || null,
      createdAt: now,
      updatedAt: now
    };

    const payment = {
      id: paymentId,
      appointmentId,
      patientId,
      amount,
      status: "PENDING" as const,
      provider: "PAYSTACK",
      reference,
      createdAt: now,
      updatedAt: now
    };

    // Initialize Paystack Checkout URL
    const paystackData = await initializeTransaction(req.user!.email, amount, reference);

    await db.transaction(async (trx) => {
      await trx("appointments").insert(appointment);
      await trx("payments").insert(payment);
    });

    // Send notifications via template engine
    const doctorUser = await db("users").where({ id: doctorId }).first();
    const patientUser = await db("users").where({ id: patientId }).first();
    if (doctorUser && patientUser) {
      const doctorName = `${doctorUser.firstName} ${doctorUser.lastName}`;
      const patientName = `${patientUser.firstName} ${patientUser.lastName}`;
      await sendNotificationTemplate(patientId, "APPOINTMENT_PENDING", { doctorName });
      await sendNotificationTemplate(doctorId, "APPOINTMENT_REQUEST", { patientName });
    }

    // Log action to audit logs
    await logAction(patientId, "APPOINTMENT_BOOKED", `Booked appointment ID: ${appointmentId} with doctor ID: ${doctorId}`, req.ip);

    return sendCreated(
      res,
      {
        appointment,
        payment: {
          ...payment,
          authorizationUrl: paystackData.authorization_url
        }
      },
      "Appointment booked successfully. Payment initialized."
    );
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// List Appointments
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /appointments
 * Patient sees their own; Doctor sees their own. Filterable by status, from, to.
 */
export const listMyAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { status, from, to } = req.query as any;

    const query = db("appointments")
      .join("users as patientUser", "appointments.patientId", "=", "patientUser.id")
      .join("users as doctorUser", "appointments.doctorId", "=", "doctorUser.id")
      .select(
        "appointments.*",
        "patientUser.firstName as patientFirstName",
        "patientUser.lastName as patientLastName",
        "patientUser.avatarUrl as patientAvatar",
        "doctorUser.firstName as doctorFirstName",
        "doctorUser.lastName as doctorLastName",
        "doctorUser.avatarUrl as doctorAvatar"
      );

    if (role === "PATIENT") {
      query.where("appointments.patientId", userId);
    } else if (role === "DOCTOR") {
      query.where("appointments.doctorId", userId);
    }

    if (status) query.where("appointments.status", status);
    if (from) query.where("appointments.dateTime", ">=", from);
    if (to) query.where("appointments.dateTime", "<=", to);

    query.orderBy("appointments.dateTime", "desc");

    const appointments = await query;
    return sendSuccess(res, appointments, "Appointments retrieved.");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /appointments/:id
 * Returns the appointment with patient/doctor info and consultation if it exists.
 */
export const getAppointmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { id } = req.params;

    const appointment = await db("appointments")
      .join("users as patientUser", "appointments.patientId", "=", "patientUser.id")
      .join("users as doctorUser", "appointments.doctorId", "=", "doctorUser.id")
      .select(
        "appointments.*",
        "patientUser.firstName as patientFirstName",
        "patientUser.lastName as patientLastName",
        "patientUser.avatarUrl as patientAvatar",
        "patientUser.email as patientEmail",
        "doctorUser.firstName as doctorFirstName",
        "doctorUser.lastName as doctorLastName",
        "doctorUser.avatarUrl as doctorAvatar",
        "doctorUser.email as doctorEmail"
      )
      .where("appointments.id", id)
      .first();

    if (!appointment) return sendNotFound(res, "Appointment not found.");

    // Ownership check: patients/doctors can only see their own
    if (role !== "ADMIN" && appointment.patientId !== userId && appointment.doctorId !== userId) {
      return sendForbidden(res, "Access denied.");
    }

    // Attach consultation if exists
    const consultation = await ConsultationModel.findOne({ appointmentId: id });
    const result = { ...appointment, consultation: consultation || null };

    return sendSuccess(res, result, "Appointment retrieved.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Doctor: Confirm / Reject
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PATCH /appointments/:id/confirm
 * Doctor confirms → CONFIRMED, atomically creates Consultation.
 */
export const confirmAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user!.id;
    const { id } = req.params;

    const appointment = await AppointmentModel.findById(id);
    if (!appointment) return sendNotFound(res, "Appointment not found.");
    if (appointment.doctorId !== doctorId) return sendForbidden(res, "Not your appointment.");
    if (appointment.status !== "PENDING") {
      return sendBadRequest(res, `Cannot confirm an appointment with status "${appointment.status}".`);
    }

    await db.transaction(async (trx) => {
      await trx("appointments").where({ id }).update({ status: "CONFIRMED", updatedAt: new Date().toISOString() });
      await trx("consultations").insert({
        id: crypto.randomUUID(),
        appointmentId: id
      });
    });

    const updated = await AppointmentModel.findById(id);
    const consultation = await ConsultationModel.findOne({ appointmentId: id });

    // Notify Patient via template engine
    const doctorUser = await db("users").where({ id: doctorId }).first();
    if (doctorUser) {
      const doctorName = `${doctorUser.firstName} ${doctorUser.lastName}`;
      await sendNotificationTemplate(appointment.patientId, "APPOINTMENT_CONFIRMED", { doctorName });
    }

    // Log action to audit logs
    await logAction(doctorId, "APPOINTMENT_CONFIRMED", `Confirmed appointment ID: ${id} with patient ID: ${appointment.patientId}`, req.ip);

    return sendSuccess(res, { ...updated, consultation }, "Appointment confirmed. Consultation created.");
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /appointments/:id/reject
 * Doctor rejects → REJECTED.
 */
export const rejectAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user!.id;
    const { id } = req.params;

    const appointment = await AppointmentModel.findById(id);
    if (!appointment) return sendNotFound(res, "Appointment not found.");
    if (appointment.doctorId !== doctorId) return sendForbidden(res, "Not your appointment.");
    if (appointment.status !== "PENDING") {
      return sendBadRequest(res, `Cannot reject an appointment with status "${appointment.status}".`);
    }

    await AppointmentModel.update(id, { status: "REJECTED", updatedAt: new Date().toISOString() } as any);
    const updated = await AppointmentModel.findById(id);

    // Notify Patient via template engine
    const doctorUser = await db("users").where({ id: doctorId }).first();
    if (doctorUser) {
      const doctorName = `${doctorUser.firstName} ${doctorUser.lastName}`;
      await sendNotificationTemplate(appointment.patientId, "APPOINTMENT_REJECTED", { doctorName });
    }

    // Log action to audit logs
    await logAction(doctorId, "APPOINTMENT_REJECTED", `Rejected appointment ID: ${id} with patient ID: ${appointment.patientId}`, req.ip);

    return sendSuccess(res, updated, "Appointment rejected.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Cancel (Patient / Doctor / Admin)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PATCH /appointments/:id/cancel
 * Any authenticated party can cancel if PENDING or CONFIRMED.
 */
export const cancelAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { id } = req.params;

    const appointment = await AppointmentModel.findById(id);
    if (!appointment) return sendNotFound(res, "Appointment not found.");

    // Ownership check: only the patient, their doctor, or an admin
    if (role !== "ADMIN" && appointment.patientId !== userId && appointment.doctorId !== userId) {
      return sendForbidden(res, "Access denied.");
    }

    if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
      return sendBadRequest(res, `Cannot cancel an appointment with status "${appointment.status}".`);
    }

    await AppointmentModel.update(id, { status: "CANCELLED", updatedAt: new Date().toISOString() } as any);
    const updated = await AppointmentModel.findById(id);

    // Notify participants via template engine
    const formattedDate = new Date(appointment.dateTime).toLocaleDateString();
    if (role === "ADMIN") {
      await sendNotificationTemplate(appointment.patientId, "APPOINTMENT_CANCELLED", { date: formattedDate, cancelledBy: "Admin" });
      await sendNotificationTemplate(appointment.doctorId, "APPOINTMENT_CANCELLED", { date: formattedDate, cancelledBy: "Admin" });
    } else {
      const cancellingUser = await db("users").where({ id: userId }).first();
      const isPatient = appointment.patientId === userId;
      const recipientId = isPatient ? appointment.doctorId : appointment.patientId;
      if (cancellingUser) {
        const cancelledBy = `${cancellingUser.firstName} ${cancellingUser.lastName}`;
        await sendNotificationTemplate(recipientId, "APPOINTMENT_CANCELLED", { date: formattedDate, cancelledBy });
      }
    }

    // Log action to audit logs
    await logAction(userId, "APPOINTMENT_CANCELLED", `Cancelled appointment ID: ${id} (Role: ${role})`, req.ip);

    return sendSuccess(res, updated, "Appointment cancelled.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin: List All
// ─────────────────────────────────────────────────────────────────────────────

export const rescheduleAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { date, time } = req.body;

    if (!date || !time) {
      return sendBadRequest(res, "Date and time are required for rescheduling.");
    }

    const appt = await db("appointments").where({ id }).first();
    if (!appt) {
      return sendNotFound(res, "Appointment not found.");
    }

    if (appt.patientId !== userId && appt.doctorId !== userId) {
      return sendForbidden(res, "Access denied.");
    }

    const dateTime = new Date(`${date} ${time}`).toISOString();
    await db("appointments").where({ id }).update({
      dateTime,
      status: "PENDING",
      updatedAt: new Date().toISOString()
    });

    const updated = await db("appointments").where({ id }).first();
    return sendSuccess(res, updated, "Appointment rescheduled successfully.");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /admin/appointments
 * All appointments, filterable by doctorId, patientId, status, date range.
 */
export const listAllAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { doctorId, patientId, status, from, to } = req.query as any;

    const query = db("appointments")
      .join("users as patientUser", "appointments.patientId", "=", "patientUser.id")
      .join("users as doctorUser", "appointments.doctorId", "=", "doctorUser.id")
      .select(
        "appointments.*",
        "patientUser.firstName as patientFirstName",
        "patientUser.lastName as patientLastName",
        "doctorUser.firstName as doctorFirstName",
        "doctorUser.lastName as doctorLastName"
      );

    if (doctorId) query.where("appointments.doctorId", doctorId);
    if (patientId) query.where("appointments.patientId", patientId);
    if (status) query.where("appointments.status", status);
    if (from) query.where("appointments.dateTime", ">=", from);
    if (to) query.where("appointments.dateTime", "<=", to);

    query.orderBy("appointments.dateTime", "desc");

    const appointments = await query;
    return sendSuccess(res, appointments, "All appointments retrieved.");
  } catch (err) {
    next(err);
  }
};
