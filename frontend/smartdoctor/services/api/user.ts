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

  /**
   * Fetch doctors directory data (specialties, all approved doctors).
   */
  async getDoctorsDirectory(): Promise<ApiResponse<any>> {
    const response = await apiClient.get(API_ENDPOINTS.USERS.DIRECTORY);
    return response.data;
  },

  /**
   * Fetch details of a single doctor by their ID.
   */
  async getDoctorDetail(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.get(API_ENDPOINTS.USERS.DOCTOR_DETAIL(id));
    return response.data;
  },

  /**
   * Update the current user's profile details.
   */
  async updateProfile(data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.put(API_ENDPOINTS.USERS.PROFILE, data);
    return response.data;
  },
};
