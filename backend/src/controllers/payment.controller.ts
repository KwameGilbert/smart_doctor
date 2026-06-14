import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import db from "../config/db";
import { PaymentModel } from "../models/payment.model";
import { TransactionModel } from "../models/transaction.model";
import { verifyTransaction } from "../services/paystack.service";
import { sendNotificationTemplate } from "../services/notification.service";
import { logAction } from "../services/audit.service";
import {
  sendSuccess,
  sendBadRequest,
  sendNotFound,
  sendForbidden,
  sendCreated
} from "../helpers/response.helper";

// ─────────────────────────────────────────────────────────────────────────────
// POST /payments/verify
// ─────────────────────────────────────────────────────────────────────────────
export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reference } = req.body;
    if (!reference) {
      return sendBadRequest(res, "Missing transaction reference.");
    }

    // Find the payment record
    const payment = await PaymentModel.findOne({ reference });
    if (!payment) {
      return sendNotFound(res, "Payment record not found for this reference.");
    }

    // If payment is already verified, return it (idempotency check)
    if (payment.status === "SUCCESSFUL") {
      return sendSuccess(res, payment, "Payment has already been successfully verified.");
    }

    // Call Paystack Service to verify status
    const verification = await verifyTransaction(reference);

    const now = new Date().toISOString();

    if (!verification.status) {
      // Update payment record to FAILED
      await PaymentModel.update(payment.id, {
        status: "FAILED",
        updatedAt: now
      });
      return sendBadRequest(res, `Payment verification failed: ${verification.gatewayResponse}`);
    }

    // Double check appointment exists
    const appointment = await db("appointments").where({ id: payment.appointmentId }).first();
    if (!appointment) {
      return sendNotFound(res, "Associated appointment not found.");
    }

    // Verification succeeded: Update payment, confirm appointment, create consultation, and log transaction
    await db.transaction(async (trx) => {
      // 1. Update Payment record to SUCCESSFUL
      await trx("payments")
        .where({ id: payment.id })
        .update({
          status: "SUCCESSFUL",
          updatedAt: now
        });

      // 2. Update Appointment to CONFIRMED if it was PENDING
      if (appointment.status === "PENDING") {
        await trx("appointments")
          .where({ id: appointment.id })
          .update({
            status: "CONFIRMED",
            updatedAt: now
          });

        // 3. Atomically create Consultation if not already exists
        const consultationExists = await trx("consultations")
          .where({ appointmentId: appointment.id })
          .first();

        if (!consultationExists) {
          await trx("consultations").insert({
            id: crypto.randomUUID(),
            appointmentId: appointment.id,
            createdAt: now,
            updatedAt: now
          });
        }
      }

      // 4. Log Patient Credit Transaction
      await trx("transactions").insert({
        id: crypto.randomUUID(),
        paymentId: payment.id,
        userId: payment.patientId,
        amount: payment.amount,
        type: "CREDIT",
        description: `Consultation fee payment for Appointment ${appointment.id}`,
        createdAt: now
      });
    });

    const updatedPayment = await PaymentModel.findById(payment.id);

    // Send notifications via template engine
    const patientUser = await db("users").where({ id: payment.patientId }).first();
    if (patientUser) {
      const patientName = `${patientUser.firstName} ${patientUser.lastName}`;
      await sendNotificationTemplate(payment.patientId, "PAYMENT_SUCCESS", { amount: payment.amount });
      await sendNotificationTemplate(appointment.doctorId, "APPOINTMENT_CONFIRMED", { patientName, amount: payment.amount });
    }

    // Log action to audit logs
    await logAction(payment.patientId, "PAYMENT_VERIFIED", `Verified payment ref: ${reference} of amount: ${payment.amount} for appointment: ${payment.appointmentId}`, req.ip);

    return sendSuccess(res, updatedPayment, "Payment verified successfully. Appointment confirmed.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /payments
// ─────────────────────────────────────────────────────────────────────────────
export const listPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { patientId, status } = req.query as any;

    const query = db("payments")
      .join("users as patientUser", "payments.patientId", "=", "patientUser.id")
      .join("appointments", "payments.appointmentId", "=", "appointments.id")
      .join("users as doctorUser", "appointments.doctorId", "=", "doctorUser.id")
      .select(
        "payments.*",
        "patientUser.firstName as patientFirstName",
        "patientUser.lastName as patientLastName",
        "doctorUser.firstName as doctorFirstName",
        "doctorUser.lastName as doctorLastName"
      );

    if (role === "PATIENT") {
      query.where("payments.patientId", userId);
    } else if (role === "DOCTOR") {
      query.where("appointments.doctorId", userId);
    } else if (role === "ADMIN") {
      if (patientId) query.where("payments.patientId", patientId);
    }

    if (status) {
      query.where("payments.status", status);
    }

    query.orderBy("payments.createdAt", "desc");
    const payments = await query;

    return sendSuccess(res, payments, "Payments retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /payments/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getPaymentDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { id } = req.params;

    const payment = await db("payments")
      .join("users as patientUser", "payments.patientId", "=", "patientUser.id")
      .join("appointments", "payments.appointmentId", "=", "appointments.id")
      .join("users as doctorUser", "appointments.doctorId", "=", "doctorUser.id")
      .select(
        "payments.*",
        "patientUser.firstName as patientFirstName",
        "patientUser.lastName as patientLastName",
        "doctorUser.firstName as doctorFirstName",
        "doctorUser.lastName as doctorLastName"
      )
      .where("payments.id", id)
      .first();

    if (!payment) {
      return sendNotFound(res, "Payment record not found.");
    }

    // Access control
    if (role === "PATIENT" && payment.patientId !== userId) {
      return sendForbidden(res, "Access denied. You do not own this payment record.");
    }
    if (role === "DOCTOR" && payment.doctorId !== userId) {
      return sendForbidden(res, "Access denied. You are not associated with this payment.");
    }

    return sendSuccess(res, payment, "Payment details retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /payments/transactions
// ─────────────────────────────────────────────────────────────────────────────
export const listTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    const query = db("transactions")
      .leftJoin("payments", "transactions.paymentId", "=", "payments.id")
      .leftJoin("appointments", "payments.appointmentId", "=", "appointments.id")
      .select(
        "transactions.*",
        "payments.reference as paymentReference",
        "appointments.doctorId"
      );

    if (role === "PATIENT") {
      query.where("transactions.userId", userId);
    } else if (role === "DOCTOR") {
      query.where("appointments.doctorId", userId);
    }

    query.orderBy("transactions.createdAt", "desc");
    const transactions = await query;

    return sendSuccess(res, transactions, "Transactions retrieved successfully.");
  } catch (err) {
    next(err);
  }
};
