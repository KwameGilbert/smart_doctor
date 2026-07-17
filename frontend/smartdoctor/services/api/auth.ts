import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";

export interface RegisterPayload {
  email: string;
  password?: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  role: "PATIENT" | "DOCTOR";
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface VerifyPayload {
  emailOrPhone: string;
  code: string;
}

export interface ResetPasswordPayload {
  emailOrPhone: string;
  code: string;
  password?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  phoneNumber?: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data: T;
}

export interface LoginData {
  token?: string;
  isVerified?: boolean;
  user?: User;
}

export interface RegisterData {
  token?: string;
  isVerified?: boolean;
  user?: User;
}

export const authApi = {
  /**
   * Register a new Patient or Doctor account.
   */
  async register(payload: RegisterPayload): Promise<ApiResponse<RegisterData>> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, payload);
    return response.data;
  },

  /**
   * Login with email and password.
   */
  async login(payload: LoginPayload): Promise<ApiResponse<LoginData>> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, payload);
    return response.data;
  },

  /**
   * Verify an account with an OTP code.
   */
  async verify(payload: VerifyPayload): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY, payload);
    return response.data;
  },

  /**
   * Resend the OTP verification code.
   */
  async resendOtp(emailOrPhone: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.RESEND_OTP, { emailOrPhone });
    return response.data;
  },

  /**
   * Send a password reset request code.
   */
  async forgotPassword(emailOrPhone: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { emailOrPhone });
    return response.data;
  },

  /**
   * Reset the password using the reset code.
   */
  async resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse<null>> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload);
    return response.data;
  },
};
