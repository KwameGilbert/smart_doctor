import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import db from "../config/db";
import { UserModel } from "../models/user.model";
import { OtpModel } from "../models/otp.model";
import { hashPassword, comparePassword } from "../helpers/hash.helper";
import { generateToken } from "../helpers/jwt.helper";
import { generateOTP } from "../helpers/otp.helper";
import { sendEmail } from "../services/email.service";
import { sendSuccess, sendCreated, sendBadRequest, sendForbidden } from "../helpers/response.helper";
import { getOTPTemplate } from "../templates/otp.template";
import { getResetTemplate } from "../templates/reset.template";
import { logAction } from "../services/audit.service";

/**
 * Handle user registration request.
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, phoneNumber, firstName, lastName, role } = req.body;
    if (!email || !password || !firstName || !lastName || !role) {
      return sendBadRequest(res, "Missing required fields (email, password, firstName, lastName, role).");
    }

    if (role !== "PATIENT" && role !== "DOCTOR") {
      return sendBadRequest(res, "Invalid registration role. Must be PATIENT or DOCTOR.");
    }

    // Check if email or phone already exists using model helpers
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      return sendBadRequest(res, "Email is already registered.");
    }

    if (phoneNumber) {
      const existingPhone = await UserModel.findByPhone(phoneNumber);
      if (existingPhone) {
        return sendBadRequest(res, "Phone number is already registered.");
      }
    }

    const hashedPassword = await hashPassword(password);
    const userId = crypto.randomUUID();
    const { code: otpCode, expires: otpExpires } = generateOTP();

    // Call Model to execute User creation transaction
    await UserModel.createWithProfile(
      {
        id: userId,
        email,
        password: hashedPassword,
        phoneNumber,
        firstName,
        lastName,
        role,
        isVerified: true
      },
      {}, // Defaults will be populated inside the transaction based on role
      {
        id: crypto.randomUUID(),
        code: otpCode,
        expiresAt: otpExpires
      }
    );

    // Log action to audit logs
    await logAction(userId, "USER_REGISTERED", `User registered with email: ${email} and role: ${role}`, req.ip);

    // Send OTP via email only if not pre-verified (e.g., PATIENT)
    if (role !== "DOCTOR") {
      sendEmail(
        email,
        "Smart Doctor - Verification Code",
        getOTPTemplate(firstName, otpCode)
      );
    }

    const token = generateToken({ id: userId, email, role });

    return sendCreated(res, {
      token,
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        role,
        phoneNumber,
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }, "Registration successful.");
  } catch (error: any) {
    next(error);
  }
};

/**
 * Handle OTP verification request.
 */
export const verify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { emailOrPhone, code } = req.body;
    if (!emailOrPhone || !code) {
      return sendBadRequest(res, "Missing required fields (emailOrPhone, code).");
    }

    // Find user by email or phone
    const user = await UserModel.findByEmailOrPhone(emailOrPhone);
    if (!user) {
      return sendBadRequest(res, "User not found.");
    }

    if (user.isVerified) {
      return sendSuccess(res, { message: "Account is already verified." });
    }

    // Find latest OTP code for this user
    const latestOtp = await OtpModel.findLatest(user.id, "VERIFICATION");
    if (!latestOtp || latestOtp.code !== code) {
      return sendBadRequest(res, "Invalid verification code.");
    }

    if (new Date() > new Date(latestOtp.expiresAt)) {
      return sendBadRequest(res, "Verification code has expired.");
    }

    // Activate and delete OTPs via model transaction helper
    await OtpModel.verifyAndActivateUser(user.id);

    // Log action to audit logs
    await logAction(user.id, "USER_VERIFIED", "User verified their account", req.ip);

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }, "Account verified successfully.");
  } catch (error: any) {
    next(error);
  }
};

/**
 * Handle resending OTP code request.
 */
export const resend = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { emailOrPhone } = req.body;
    if (!emailOrPhone) {
      return sendBadRequest(res, "Missing emailOrPhone field.");
    }

    const user = await UserModel.findByEmailOrPhone(emailOrPhone);
    if (!user) {
      return sendBadRequest(res, "User not found.");
    }

    if (user.isVerified) {
      return sendBadRequest(res, "Account is already verified.");
    }

    const { code: otpCode, expires: otpExpires } = generateOTP();

    // Create record using OtpModel
    await OtpModel.create({
      id: crypto.randomUUID(),
      userId: user.id,
      code: otpCode,
      purpose: "VERIFICATION",
      expiresAt: otpExpires
    });

    // Send OTP via email
    sendEmail(
      user.email,
      "Smart Doctor - Verification Code",
      getOTPTemplate(user.firstName, otpCode)
    );

    return sendSuccess(res, null, "Verification code resent successfully.");
  } catch (error: any) {
    next(error);
  }
};

/**
 * Handle login request.
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendBadRequest(res, "Missing email or password.");
    }

    const user = await UserModel.findByEmailOrPhone(email);
    if (!user) {
      return sendBadRequest(res, "Invalid email/phone or password.");
    }

    const isPasswordMatch = await comparePassword(password, user.password!);
    if (!isPasswordMatch) {
      return sendBadRequest(res, "Invalid email or password.");
    }

    if (user.isActive === false) {
      return sendForbidden(res, "Your account has been suspended. Please contact support.");
    }

    if (!user.isVerified) {
      const { code: otpCode, expires: otpExpires } = generateOTP();
      
      await OtpModel.create({
        id: crypto.randomUUID(),
        userId: user.id,
        code: otpCode,
        purpose: "VERIFICATION",
        expiresAt: otpExpires
      });

      // Send OTP via email
      sendEmail(
        user.email,
        "Smart Doctor - Verification Code",
        getOTPTemplate(user.firstName, otpCode)
      );

      return sendSuccess(res, { isVerified: false }, "Account is not verified. A verification code has been sent.");
    }

    // Log action to audit logs
    await logAction(user.id, "USER_LOGIN", "User logged in", req.ip);

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }, "Login successful.");
  } catch (error: any) {
    next(error);
  }
};

/**
 * Handle password reset request (Forgot Password).
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendBadRequest(res, "Missing email address.");
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      // Return 200 success anyway to prevent email enumeration/harvesting attacks
      return sendSuccess(res, null, "If the email is registered, a password reset code has been sent.");
    }

    const { code: otpCode, expires: otpExpires } = generateOTP();

    // Create password reset OTP record
    await OtpModel.create({
      id: crypto.randomUUID(),
      userId: user.id,
      code: otpCode,
      purpose: "PASSWORD_RESET",
      expiresAt: otpExpires
    });

    // Send password reset code via email
    sendEmail(
      user.email,
      "Smart Doctor - Reset Password Code",
      getResetTemplate(user.firstName, otpCode)
    );

    return sendSuccess(res, null, "If the email is registered, a password reset code has been sent.");
  } catch (error: any) {
    next(error);
  }
};

/**
 * Reset password using the code received via email/sms.
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return sendBadRequest(res, "Missing required fields (email, code, newPassword).");
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return sendBadRequest(res, "Invalid request details.");
    }

    // Find the latest password reset code
    const latestOtp = await OtpModel.findLatest(user.id, "PASSWORD_RESET");
    if (!latestOtp || latestOtp.code !== code) {
      return sendBadRequest(res, "Invalid password reset code.");
    }

    if (new Date() > new Date(latestOtp.expiresAt)) {
      return sendBadRequest(res, "Password reset code has expired.");
    }

    const hashedNewPassword = await hashPassword(newPassword);

    // Update password and clear password reset OTPs in transaction
    await db.transaction(async (trx) => {
      await trx("users")
        .where("id", user.id)
        .update({ password: hashedNewPassword });

      await trx("otps")
        .where({ userId: user.id, purpose: "PASSWORD_RESET" })
        .del();
    });

    // Log action to audit logs
    await logAction(user.id, "PASSWORD_RESET", "User reset their password", req.ip);

    return sendSuccess(res, null, "Password reset successfully. You can now login with your new password.");
  } catch (error: any) {
    next(error);
  }
};
