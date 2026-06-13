import db from "../config/db";
import { BaseModel } from "./base.model";

export interface User {
  id: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PatientProfile {
  id: string;
  dob?: Date;
  gender?: string;
  bloodGroup?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DoctorProfile {
  id: string;
  bio?: string;
  consultationFee: number;
  licenseNumber?: string;
  experienceYears: number;
  rating: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Model helper class for User database operations, inheriting from BaseModel.
 */
export class UserModelClass extends BaseModel<User> {
  constructor() {
    super("users");
  }

  /**
   * Find a user by their email address.
   */
  async findByEmail(email: string): Promise<User | undefined> {
    return this.findOne({ email });
  }

  /**
   * Find a user by their phone number.
   */
  async findByPhone(phoneNumber: string): Promise<User | undefined> {
    return this.findOne({ phoneNumber });
  }

  /**
   * Find a user by email or phone number.
   */
  async findByEmailOrPhone(emailOrPhone: string): Promise<User | undefined> {
    return db(this.tableName)
      .where("email", emailOrPhone)
      .orWhere("phoneNumber", emailOrPhone)
      .first();
  }

  /**
   * Create a new User along with their role-specific profile (Patient or Doctor) in a transaction.
   */
  async createWithProfile(
    user: User,
    profileData: Omit<PatientProfile, "id"> | Omit<DoctorProfile, "id">,
    otpData: { id: string; code: string; expiresAt: Date; purpose?: "VERIFICATION" | "PASSWORD_RESET" }
  ): Promise<User> {
    return db.transaction(async (trx) => {
      // 1. Insert base user
      await trx("users").insert({
        id: user.id,
        email: user.email,
        password: user.password,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified
      });

      // 2. Insert OTP code
      await trx("otps").insert({
        id: otpData.id,
        userId: user.id,
        code: otpData.code,
        purpose: otpData.purpose || "VERIFICATION",
        expiresAt: otpData.expiresAt
      });

      // 3. Insert profile based on role
      if (user.role === "PATIENT") {
        await trx("patients").insert({
          id: user.id,
          dob: null,
          gender: null,
          bloodGroup: null,
          allergies: null,
          emergencyContactName: null,
          emergencyContactPhone: null
        });
      } else if (user.role === "DOCTOR") {
        await trx("doctors").insert({
          id: user.id,
          bio: "",
          consultationFee: 0.00,
          licenseNumber: null,
          experienceYears: 0,
          rating: 0.0,
          status: "PENDING"
        });
      }

      return user;
    });
  }
}

export const UserModel = new UserModelClass();
