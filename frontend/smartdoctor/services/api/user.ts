import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { User, ApiResponse } from "./auth";

export const userApi = {
  /**
   * Fetch current authenticated user's profile details.
   */
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await apiClient.get(API_ENDPOINTS.USERS.PROFILE);
    return response.data;
  },

  /**
   * Fetch home dashboard data (user, specialties, top/other doctors).
   */
  async getHomeDashboard(): Promise<ApiResponse<any>> {
    const response = await apiClient.get(API_ENDPOINTS.USERS.HOME);
    return response.data;
  },
};
