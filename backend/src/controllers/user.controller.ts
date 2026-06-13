import { Request, Response, NextFunction } from "express";
import db from "../config/db";
import { UserModel } from "../models/user.model";
import { PatientModel } from "../models/patient.model";
import { DoctorModel } from "../models/doctor.model";
import {
  sendSuccess,
  sendBadRequest,
  sendNotFound,
  sendServerError
} from "../helpers/response.helper";

/**
 * Get current user's profile with joined role-specific details.
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || !role) {
      return sendBadRequest(res, "Invalid authentication payload.");
    }

    const profile = await UserModel.findFullProfile(userId, role);
    if (!profile) {
      return sendNotFound(res, "Profile not found.");
    }

    return sendSuccess(res, profile, "Profile retrieved successfully.");
  } catch (error: any) {
    next(error);
  }
};

/**
 * Update current user's core and role-specific details in a transaction.
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || !role) {
      return sendBadRequest(res, "Invalid authentication payload.");
    }

    // 1. Process Core user fields
    const { firstName, lastName, phoneNumber, avatarUrl } = req.body;
    const userUpdate: any = {};
    if (firstName !== undefined) userUpdate.firstName = firstName;
    if (lastName !== undefined) userUpdate.lastName = lastName;
    if (phoneNumber !== undefined) userUpdate.phoneNumber = phoneNumber;
    if (avatarUrl !== undefined) userUpdate.avatarUrl = avatarUrl;

    // 2. Process Role-specific fields
    const patientUpdate: any = {};
    const doctorUpdate: any = {};

    if (role === "PATIENT") {
      const {
        dob,
        gender,
        bloodGroup,
        allergies,
        emergencyContactName,
        emergencyContactPhone
      } = req.body;

      if (dob !== undefined) patientUpdate.dob = dob ? new Date(dob) : null;
      if (gender !== undefined) patientUpdate.gender = gender;
      if (bloodGroup !== undefined) patientUpdate.bloodGroup = bloodGroup;
      if (allergies !== undefined) patientUpdate.allergies = allergies;
      if (emergencyContactName !== undefined) patientUpdate.emergencyContactName = emergencyContactName;
      if (emergencyContactPhone !== undefined) patientUpdate.emergencyContactPhone = emergencyContactPhone;
    } else if (role === "DOCTOR") {
      const { bio, consultationFee, experienceYears } = req.body;

      if (bio !== undefined) doctorUpdate.bio = bio;
      if (consultationFee !== undefined) {
        const fee = parseFloat(consultationFee);
        if (isNaN(fee) || fee < 0) {
          return sendBadRequest(res, "Consultation fee must be a valid non-negative number.");
        }
        doctorUpdate.consultationFee = fee;
      }
      if (experienceYears !== undefined) {
        const years = parseInt(experienceYears);
        if (isNaN(years) || years < 0) {
          return sendBadRequest(res, "Experience years must be a valid non-negative integer.");
        }
        doctorUpdate.experienceYears = years;
      }
      // Note: rating, status, licenseNumber are not updatable by doctor self-service
    }

    // 3. Execute Transaction
    await db.transaction(async (trx) => {
      // Update core user record
      if (Object.keys(userUpdate).length > 0) {
        await trx("users").where({ id: userId }).update(userUpdate);
      }

      // Update patient profile table
      if (role === "PATIENT" && Object.keys(patientUpdate).length > 0) {
        await trx("patients").where({ id: userId }).update(patientUpdate);
      }

      // Update doctor profile table
      if (role === "DOCTOR" && Object.keys(doctorUpdate).length > 0) {
        await trx("doctors").where({ id: userId }).update(doctorUpdate);
      }
    });

    // 4. Fetch and return full updated profile
    const updatedProfile = await UserModel.findFullProfile(userId, role);
    return sendSuccess(res, updatedProfile, "Profile updated successfully.");
  } catch (error: any) {
    next(error);
  }
};

/**
 * List all users with query filters (Admin only).
 */
export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, isVerified } = req.query;
    const query = db("users");

    if (role) {
      query.where({ role });
    }

    if (isVerified !== undefined) {
      query.where({ isVerified: isVerified === "true" });
    }

    const users = await query
      .select("id", "email", "phoneNumber", "firstName", "lastName", "avatarUrl", "role", "isVerified", "createdAt", "updatedAt")
      .orderBy("createdAt", "desc");

    return sendSuccess(res, users, "Users list retrieved successfully.");
  } catch (error: any) {
    next(error);
  }
};

/**
 * Get profile of a specific user (Admin only).
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const profile = await UserModel.findFullProfileById(id);

    if (!profile) {
      return sendNotFound(res, "User not found.");
    }

    return sendSuccess(res, profile, "User profile retrieved successfully.");
  } catch (error: any) {
    next(error);
  }
};

/**
 * Update any user's profile (Admin override).
 */
export const updateUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) {
      return sendNotFound(res, "User not found.");
    }

    const role = user.role;

    // 1. Process Core user fields
    const { firstName, lastName, phoneNumber, avatarUrl, isVerified } = req.body;
    const userUpdate: any = {};
    if (firstName !== undefined) userUpdate.firstName = firstName;
    if (lastName !== undefined) userUpdate.lastName = lastName;
    if (phoneNumber !== undefined) userUpdate.phoneNumber = phoneNumber;
    if (avatarUrl !== undefined) userUpdate.avatarUrl = avatarUrl;
    if (isVerified !== undefined) userUpdate.isVerified = isVerified === true || isVerified === "true";

    // 2. Process Role-specific fields
    const patientUpdate: any = {};
    const doctorUpdate: any = {};

    if (role === "PATIENT") {
      const {
        dob,
        gender,
        bloodGroup,
        allergies,
        emergencyContactName,
        emergencyContactPhone
      } = req.body;

      if (dob !== undefined) patientUpdate.dob = dob ? new Date(dob) : null;
      if (gender !== undefined) patientUpdate.gender = gender;
      if (bloodGroup !== undefined) patientUpdate.bloodGroup = bloodGroup;
      if (allergies !== undefined) patientUpdate.allergies = allergies;
      if (emergencyContactName !== undefined) patientUpdate.emergencyContactName = emergencyContactName;
      if (emergencyContactPhone !== undefined) patientUpdate.emergencyContactPhone = emergencyContactPhone;
    } else if (role === "DOCTOR") {
      const { bio, consultationFee, licenseNumber, experienceYears, rating, status } = req.body;

      if (bio !== undefined) doctorUpdate.bio = bio;
      if (licenseNumber !== undefined) doctorUpdate.licenseNumber = licenseNumber;
      if (rating !== undefined) {
        const docRating = parseFloat(rating);
        if (!isNaN(docRating)) doctorUpdate.rating = docRating;
      }
      if (status !== undefined) {
        if (!["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].includes(status)) {
          return sendBadRequest(res, "Invalid status choice.");
        }
        doctorUpdate.status = status;
      }

      if (consultationFee !== undefined) {
        const fee = parseFloat(consultationFee);
        if (isNaN(fee) || fee < 0) {
          return sendBadRequest(res, "Consultation fee must be a valid non-negative number.");
        }
        doctorUpdate.consultationFee = fee;
      }
      if (experienceYears !== undefined) {
        const years = parseInt(experienceYears);
        if (isNaN(years) || years < 0) {
          return sendBadRequest(res, "Experience years must be a valid non-negative integer.");
        }
        doctorUpdate.experienceYears = years;
      }
    }

    // 3. Execute Transaction
    await db.transaction(async (trx) => {
      if (Object.keys(userUpdate).length > 0) {
        await trx("users").where({ id }).update(userUpdate);
      }

      if (role === "PATIENT" && Object.keys(patientUpdate).length > 0) {
        await trx("patients").where({ id }).update(patientUpdate);
      }

      if (role === "DOCTOR" && Object.keys(doctorUpdate).length > 0) {
        await trx("doctors").where({ id }).update(doctorUpdate);
      }
    });

    const updatedProfile = await UserModel.findFullProfile(id, role);
    return sendSuccess(res, updatedProfile, "User updated successfully.");
  } catch (error: any) {
    next(error);
  }
};

/**
 * Delete a user and associated profiles (Admin only).
 */
export const deleteUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) {
      return sendNotFound(res, "User not found.");
    }

    // BaseModel.delete handles deletion (which cascades automatically in the DB layer)
    await UserModel.delete(id);

    return sendSuccess(res, null, "User and associated profile deleted successfully.");
  } catch (error: any) {
    next(error);
  }
};

/**
 * Approve or reject doctor verification status (Admin only).
 */
export const updateDoctorStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // Doctor's User ID
    const { status } = req.body;

    if (!status || !["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].includes(status)) {
      return sendBadRequest(
        res,
        "Missing or invalid status. Must be one of PENDING, APPROVED, REJECTED, SUSPENDED."
      );
    }

    const doctorProfile = await DoctorModel.findById(id);
    if (!doctorProfile) {
      return sendNotFound(res, "Doctor profile not found.");
    }

    await DoctorModel.update(id, { status });

    const fullProfile = await UserModel.findFullProfile(id, "DOCTOR");
    return sendSuccess(res, fullProfile, `Doctor status updated to ${status} successfully.`);
  } catch (error: any) {
    next(error);
  }
};
