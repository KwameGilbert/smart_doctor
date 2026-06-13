import { Request, Response, NextFunction } from "express";
import db from "../config/db";
import { UserModel } from "../models/user.model";
import { DoctorModel } from "../models/doctor.model";
import { PatientModel } from "../models/patient.model";
import {
  sendSuccess,
  sendBadRequest,
  sendNotFound
} from "../helpers/response.helper";

/**
 * List all Patients with their profile details joined.
 */
export const listPatients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patients = await db("users")
      .join("patients", "users.id", "=", "patients.id")
      .select(
        "users.id",
        "users.email",
        "users.phoneNumber",
        "users.firstName",
        "users.lastName",
        "users.avatarUrl",
        "users.role",
        "users.isVerified",
        "users.isActive",
        "users.createdAt",
        "users.updatedAt",
        "patients.dob",
        "patients.gender",
        "patients.bloodGroup",
        "patients.allergies",
        "patients.emergencyContactName",
        "patients.emergencyContactPhone"
      )
      .orderBy("users.createdAt", "desc");

    return sendSuccess(res, patients, "Patients list retrieved successfully.");
  } catch (error: any) {
    next(error);
  }
};

/**
 * List all Doctors with their profile details joined.
 */
export const listDoctors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctors = await db("users")
      .join("doctors", "users.id", "=", "doctors.id")
      .select(
        "users.id",
        "users.email",
        "users.phoneNumber",
        "users.firstName",
        "users.lastName",
        "users.avatarUrl",
        "users.role",
        "users.isVerified",
        "users.isActive",
        "users.createdAt",
        "users.updatedAt",
        "doctors.bio",
        "doctors.consultationFee",
        "doctors.licenseNumber",
        "doctors.experienceYears",
        "doctors.rating",
        "doctors.status"
      )
      .orderBy("users.createdAt", "desc");

    return sendSuccess(res, doctors, "Doctors list retrieved successfully.");
  } catch (error: any) {
    next(error);
  }
};

/**
 * Update any Patient's profile (Admin only).
 */
export const updatePatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user || user.role !== "PATIENT") {
      return sendNotFound(res, "Patient not found.");
    }

    const {
      firstName,
      lastName,
      phoneNumber,
      avatarUrl,
      isVerified,
      dob,
      gender,
      bloodGroup,
      allergies,
      emergencyContactName,
      emergencyContactPhone
    } = req.body;

    const userUpdate: any = {};
    if (firstName !== undefined) userUpdate.firstName = firstName;
    if (lastName !== undefined) userUpdate.lastName = lastName;
    if (phoneNumber !== undefined) userUpdate.phoneNumber = phoneNumber;
    if (avatarUrl !== undefined) userUpdate.avatarUrl = avatarUrl;
    if (isVerified !== undefined) userUpdate.isVerified = isVerified === true || isVerified === "true";

    const patientUpdate: any = {};
    if (dob !== undefined) patientUpdate.dob = dob ? new Date(dob) : null;
    if (gender !== undefined) patientUpdate.gender = gender;
    if (bloodGroup !== undefined) patientUpdate.bloodGroup = bloodGroup;
    if (allergies !== undefined) patientUpdate.allergies = allergies;
    if (emergencyContactName !== undefined) patientUpdate.emergencyContactName = emergencyContactName;
    if (emergencyContactPhone !== undefined) patientUpdate.emergencyContactPhone = emergencyContactPhone;

    await db.transaction(async (trx) => {
      if (Object.keys(userUpdate).length > 0) {
        await trx("users").where({ id }).update(userUpdate);
      }
      if (Object.keys(patientUpdate).length > 0) {
        await trx("patients").where({ id }).update(patientUpdate);
      }
    });

    const updatedProfile = await UserModel.findFullProfile(id, "PATIENT");
    return sendSuccess(res, updatedProfile, "Patient profile updated successfully.");
  } catch (error: any) {
    next(error);
  }
};

/**
 * Update any Doctor's profile (Admin only).
 */
export const updateDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user || user.role !== "DOCTOR") {
      return sendNotFound(res, "Doctor not found.");
    }

    const {
      firstName,
      lastName,
      phoneNumber,
      avatarUrl,
      isVerified,
      bio,
      consultationFee,
      licenseNumber,
      experienceYears,
      rating,
      status
    } = req.body;

    const userUpdate: any = {};
    if (firstName !== undefined) userUpdate.firstName = firstName;
    if (lastName !== undefined) userUpdate.lastName = lastName;
    if (phoneNumber !== undefined) userUpdate.phoneNumber = phoneNumber;
    if (avatarUrl !== undefined) userUpdate.avatarUrl = avatarUrl;
    if (isVerified !== undefined) userUpdate.isVerified = isVerified === true || isVerified === "true";

    const doctorUpdate: any = {};
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

    await db.transaction(async (trx) => {
      if (Object.keys(userUpdate).length > 0) {
        await trx("users").where({ id }).update(userUpdate);
      }
      if (Object.keys(doctorUpdate).length > 0) {
        await trx("doctors").where({ id }).update(doctorUpdate);
      }
    });

    const updatedProfile = await UserModel.findFullProfile(id, "DOCTOR");
    return sendSuccess(res, updatedProfile, "Doctor profile updated successfully.");
  } catch (error: any) {
    next(error);
  }
};

/**
 * Approve or reject doctor verification status (Admin only).
 */
export const updateDoctorStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
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

/**
 * Suspend user account globally (Admin only).
 */
export const suspendUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) {
      return sendNotFound(res, "User not found.");
    }

    await UserModel.update(id, { isActive: false });

    const fullProfile = await UserModel.findFullProfile(id, user.role);
    return sendSuccess(res, fullProfile, "User account suspended successfully.");
  } catch (error: any) {
    next(error);
  }
};

/**
 * Reactivate a user account globally (Admin only).
 */
export const activateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) {
      return sendNotFound(res, "User not found.");
    }

    await UserModel.update(id, { isActive: true });

    const fullProfile = await UserModel.findFullProfile(id, user.role);
    return sendSuccess(res, fullProfile, "User account activated successfully.");
  } catch (error: any) {
    next(error);
  }
};

/**
 * Permanently delete any user and cascade sub-profiles (Admin only).
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) {
      return sendNotFound(res, "User not found.");
    }

    await UserModel.delete(id);

    return sendSuccess(res, null, "User account deleted successfully.");
  } catch (error: any) {
    next(error);
  }
};
