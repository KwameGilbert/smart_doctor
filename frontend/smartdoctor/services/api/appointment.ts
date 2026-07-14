import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { ApiResponse } from "./auth";

export interface AppointmentData {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED";
  reason?: string;
  createdAt: string;
  updatedAt: string;
  patientFirstName?: string;
  patientLastName?: string;
  patientAvatar?: string;
  doctorFirstName?: string;
  doctorLastName?: string;
  doctorAvatar?: string;
}

export const appointmentApi = {
  /**
   * Fetch all appointments for the logged-in user.
   */
  async list(status?: string): Promise<ApiResponse<AppointmentData[]>> {
    const url = status 
      ? `${API_ENDPOINTS.APPOINTMENTS.LIST}?status=${status}`
      : API_ENDPOINTS.APPOINTMENTS.LIST;
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Book a new appointment.
   */
  async create(data: {
    doctorId: string;
    dateTime: string;
    reason?: string;
  }): Promise<ApiResponse<{ appointment: AppointmentData; payment: any }>> {
    const response = await apiClient.post(API_ENDPOINTS.APPOINTMENTS.CREATE, data);
    return response.data;
  },

  /**
   * Cancel an appointment by ID.
   */
  async cancel(id: string): Promise<ApiResponse<AppointmentData>> {
    const response = await apiClient.patch(API_ENDPOINTS.APPOINTMENTS.CANCEL(id));
    return response.data;
  },

  /**
   * Reschedule an appointment by ID.
   */
  async reschedule(id: string, data: { date: string; time: string }): Promise<ApiResponse<AppointmentData>> {
    const response = await apiClient.patch(API_ENDPOINTS.APPOINTMENTS.RESCHEDULE(id), data);
    return response.data;
  },
};
