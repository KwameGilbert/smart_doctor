import db from "../config/db";
import { BaseModel } from "./base.model";

export interface OTP {
  id: string;
  userId: string;
  code: string;
  purpose?: "VERIFICATION" | "PASSWORD_RESET";
  expiresAt: Date;
  createdAt?: Date;
}

/**
 * Model helper class for OTP database operations, inheriting from BaseModel.
 */
export class OtpModelClass extends BaseModel<OTP> {
  constructor() {
    super("otps");
  }

  /**
   * Find the most recently generated OTP for a user by purpose.
   */
  async findLatest(userId: string, purpose: "VERIFICATION" | "PASSWORD_RESET" = "VERIFICATION"): Promise<OTP | undefined> {
    return db(this.tableName)
      .where({ userId, purpose })
      .orderBy("createdAt", "desc")
      .first() as Promise<OTP | undefined>;
  }

  /**
   * Delete all OTP codes associated with a user ID.
   */
  async deleteByUserId(userId: string): Promise<number> {
    return db(this.tableName).where({ userId }).del();
  }

  /**
   * Activate user verified state and flush codes in a transaction.
   */
  async verifyAndActivateUser(userId: string): Promise<void> {
    await db.transaction(async (trx) => {
      await trx("users")
        .where("id", userId)
        .update({ isVerified: true });

      await trx("otps")
        .where({ userId })
        .del();
    });
  }
}

export const OtpModel = new OtpModelClass();
