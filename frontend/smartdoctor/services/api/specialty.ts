import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { ApiResponse } from "./auth";

export interface Specialty {
  id: string;
  name: string;
  description?: string;
  icon?: string | null;
  color?: string | null;
  bg?: string | null;
}

export const specialtyApi = {
  /**
   * Fetch all specialties from the backend.
   */
  async list(): Promise<ApiResponse<Specialty[]>> {
    const response = await apiClient.get(API_ENDPOINTS.SPECIALTIES.LIST);
    return response.data;
  },
};
