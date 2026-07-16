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
  isActive?: boolean;
  expoPushToken?: string | null;
  fcmToken?: string | null;
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
   * Find a user and their role-specific profile joined together.
   */
  async findFullProfile(userId: string, role: string): Promise<any> {
    const baseUser = await db(this.tableName).where("id", userId).first();
    if (!baseUser) return null;

    if (role === "PATIENT") {
      const patientExists = await db("patients").where("id", userId).first();
      if (!patientExists) {
        await db("patients").insert({
          id: userId,
          dob: null,
          gender: null,
          bloodGroup: null,
          allergies: null,
          emergencyContactName: null,
          emergencyContactPhone: null
        });
      }
      return db(this.tableName)
        .where("users.id", userId)
        .first()
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
          "users.expoPushToken",
          "users.fcmToken",
          "users.createdAt",
          "users.updatedAt",
          "patients.dob",
          "patients.gender",
          "patients.bloodGroup",
          "patients.allergies",
          "patients.emergencyContactName",
          "patients.emergencyContactPhone"
        );
    } else if (role === "DOCTOR") {
      const doctorExists = await db("doctors").where("id", userId).first();
      if (!doctorExists) {
        await db("doctors").insert({
          id: userId,
          bio: "",
          consultationFee: 0.00,
          licenseNumber: null,
          experienceYears: 0,
          rating: 0.0,
          status: "APPROVED"
        });
      }
      const profile = await db(this.tableName)
        .where("users.id", userId)
        .first()
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
          "users.expoPushToken",
          "users.fcmToken",
          "users.createdAt",
          "users.updatedAt",
          "doctors.bio",
          "doctors.consultationFee",
          "doctors.licenseNumber",
          "doctors.experienceYears",
          "doctors.rating",
          "doctors.status"
        );

      if (profile) {
        // Attach specialties list to doctor profile
        const specialties = await db("doctorSpecialties")
          .join("specialties", "doctorSpecialties.specialtyId", "=", "specialties.id")
          .where("doctorSpecialties.doctorId", userId)
          .select("specialties.id", "specialties.name", "specialties.description");
        profile.specialties = specialties;
      }

      return profile;
    } else if (role === "ADMIN") {
      const adminExists = await db("admins").where("id", userId).first();
      if (!adminExists) {
        await db("admins").insert({
          id: userId
        });
      }
      return db(this.tableName)
        .where("users.id", userId)
        .first()
        .join("admins", "users.id", "=", "admins.id")
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
          "users.expoPushToken",
          "users.fcmToken",
          "users.createdAt",
          "users.updatedAt"
        );
    }

    return db(this.tableName).where("id", userId).first();
  }

  /**
   * Retrieve any user's profile with their role-specific information joined, automatically detecting role.
   */
  async findFullProfileById(userId: string): Promise<any> {
    const user = await this.findById(userId);
    if (!user) return undefined;
    return this.findFullProfile(userId, user.role);
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
          status: "APPROVED"
        });
      }

      return user;
    });
  }
}

export const UserModel = new UserModelClass();
