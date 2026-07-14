import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { ApiResponse } from "./auth";

export interface MedicalRecordData {
  id: string;
  patientId: string;
  doctorId: string | null;
  recordType: string;
  description: string | null;
  attachmentUrl: string | null;
  recordDate: string;
  createdAt: string;
  patientFirstName?: string;
  patientLastName?: string;
  doctorFirstName?: string;
  doctorLastName?: string;
}

export const medicalRecordApi = {
  /**
   * Fetch all medical records for the authenticated user.
   */
  async list(): Promise<ApiResponse<MedicalRecordData[]>> {
    const response = await apiClient.get(API_ENDPOINTS.MEDICAL_RECORDS.LIST);
    return response.data;
  },

  /**
   * Create a new medical record.
   */
  async create(data: {
    patientId: string;
    recordType: string;
    description?: string;
    attachmentUrl?: string;
    recordDate: string;
  }): Promise<ApiResponse<MedicalRecordData>> {
    const response = await apiClient.post(API_ENDPOINTS.MEDICAL_RECORDS.CREATE, data);
    return response.data;
  },

  /**
   * Delete a medical record.
   */
  async delete(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.delete(API_ENDPOINTS.MEDICAL_RECORDS.DETAIL(id));
    return response.data;
  },
};
