import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import db from "../config/db";
import { ReviewModel } from "../models/review.model";
import {
  sendSuccess,
  sendBadRequest,
  sendNotFound,
  sendForbidden,
  sendCreated,
  sendNoContent
} from "../helpers/response.helper";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Recalculate Doctor Average Rating
// ─────────────────────────────────────────────────────────────────────────────
async function recalculateDoctorRating(trx: any, doctorId: string): Promise<number> {
  const result = await trx("reviews")
    .where({ doctorId })
    .avg("rating as avgRating")
    .first();

  const avgRating = parseFloat(result?.avgRating || "0");
  const rounded = Math.round(avgRating * 10) / 10; // Round to 1 decimal place

  await trx("doctors")
    .where({ id: doctorId })
    .update({ rating: rounded });

  return rounded;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /reviews
// ─────────────────────────────────────────────────────────────────────────────
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patientId = req.user!.id;
    const { doctorId, appointmentId, rating, comment } = req.body;

    if (!doctorId || !appointmentId || rating === undefined) {
      return sendBadRequest(res, "doctorId, appointmentId, and rating are required.");
    }

    const numericRating = parseInt(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return sendBadRequest(res, "Rating must be an integer between 1 and 5.");
    }

    // Verify appointment exists, belongs to the patient, and is completed
    const appointment = await db("appointments")
      .where({ id: appointmentId })
      .first();

    if (!appointment) {
      return sendNotFound(res, "Appointment not found.");
    }

    if (appointment.patientId !== patientId) {
      return sendForbidden(res, "You can only review appointments you booked.");
    }

    if (appointment.doctorId !== doctorId) {
      return sendBadRequest(res, "The doctor specified does not match this appointment.");
    }

    if (appointment.status !== "COMPLETED") {
      return sendBadRequest(res, "You can only review completed appointments.");
    }

    // Check if review already exists for this appointment (appointmentId is unique)
    const existingReview = await ReviewModel.findOne({ appointmentId });
    if (existingReview) {
      return sendBadRequest(res, "You have already reviewed this appointment.");
    }

    const reviewId = crypto.randomUUID();
    const newReview = {
      id: reviewId,
      doctorId,
      patientId,
      appointmentId,
      rating: numericRating,
      comment: comment || null,
      createdAt: new Date().toISOString()
    };

    let updatedDoctorRating = 0;

    await db.transaction(async (trx) => {
      // 1. Insert review
      await trx("reviews").insert(newReview);
      // 2. Recalculate doctor rating
      updatedDoctorRating = await recalculateDoctorRating(trx, doctorId);
    });

    return sendCreated(
      res,
      { ...newReview, updatedDoctorRating },
      "Review submitted and doctor rating updated successfully."
    );
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /reviews
// ─────────────────────────────────────────────────────────────────────────────
export const listReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { doctorId, patientId } = req.query as any;

    const query = db("reviews")
      .join("users as patientUser", "reviews.patientId", "=", "patientUser.id")
      .join("users as doctorUser", "reviews.doctorId", "=", "doctorUser.id")
      .select(
        "reviews.*",
        "patientUser.firstName as patientFirstName",
        "patientUser.lastName as patientLastName",
        "patientUser.avatarUrl as patientAvatar",
        "doctorUser.firstName as doctorFirstName",
        "doctorUser.lastName as doctorLastName"
      );

    if (doctorId) {
      query.where("reviews.doctorId", doctorId);
    }
    if (patientId) {
      query.where("reviews.patientId", patientId);
    }

    query.orderBy("reviews.createdAt", "desc");
    const reviews = await query;

    return sendSuccess(res, reviews, "Reviews retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /reviews/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getReviewDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const review = await db("reviews")
      .join("users as patientUser", "reviews.patientId", "=", "patientUser.id")
      .join("users as doctorUser", "reviews.doctorId", "=", "doctorUser.id")
      .select(
        "reviews.*",
        "patientUser.firstName as patientFirstName",
        "patientUser.lastName as patientLastName",
        "patientUser.avatarUrl as patientAvatar",
        "doctorUser.firstName as doctorFirstName",
        "doctorUser.lastName as doctorLastName"
      )
      .where("reviews.id", id)
      .first();

    if (!review) {
      return sendNotFound(res, "Review not found.");
    }

    return sendSuccess(res, review, "Review details retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /reviews/:id (Admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const review = await ReviewModel.findById(id);
    if (!review) {
      return sendNotFound(res, "Review not found.");
    }

    await db.transaction(async (trx) => {
      // 1. Delete review
      await trx("reviews").where({ id }).del();
      // 2. Recalculate doctor rating
      await recalculateDoctorRating(trx, review.doctorId);
    });

    return sendNoContent(res);
  } catch (err) {
    next(err);
  }
};
