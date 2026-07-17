import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { ApiResponse } from "./auth";

export interface MessagePayload {
  content?: string;
  attachmentUrl?: string;
  attachmentType?: "IMAGE" | "DOCUMENT" | "AUDIO";
}

export interface MessageResponse {
  id: string;
  consultationId: string;
  senderId: string;
  content: string | null;
  attachmentUrl: string | null;
  attachmentType: string | null;
  status: "SENT" | "DELIVERED" | "READ";
  createdAt: string;
  updatedAt: string;
  senderFirstName: string;
  senderLastName: string;
  senderAvatar: string | null;
  senderRole: string;
}

export interface ConsultationResponse {
  id: string;
  appointmentId: string;
  diagnosis: string | null;
  notes: string | null;
  recommendations: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
  dateTime: string;
  appointmentStatus: string;
  patientId: string;
  patientFirstName: string;
  patientLastName: string;
  patientAvatar: string | null;
  doctorId: string;
  doctorFirstName: string;
  doctorLastName: string;
  doctorAvatar: string | null;
  doctorSpecialty: string | null;
  lastMessage: MessageResponse | null;
  unreadCount: number;
}

export const consultationApi = {
  /**
   * List active consultations (chats) for the logged-in user.
   */
  async listMyConsultations(): Promise<ApiResponse<ConsultationResponse[]>> {
    const response = await apiClient.get(API_ENDPOINTS.CONSULTATIONS.LIST);
    return response.data;
  },

  /**
   * Get the consultation details between the logged-in user and a partner ID (doctor/patient ID).
   */
  async getConsultationByPartner(partnerId: string): Promise<ApiResponse<ConsultationResponse>> {
    const response = await apiClient.get(`${API_ENDPOINTS.CONSULTATIONS.LIST}/partner/${partnerId}`);
    return response.data;
  },

  /**
   * Get paginated messages for a consultation.
   */
  async getMessages(consultationId: string, page = 1, limit = 50): Promise<ApiResponse<{ messages: MessageResponse[]; total: number }>> {
    const response = await apiClient.get(`${API_ENDPOINTS.CONSULTATIONS.LIST}/${consultationId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Send a message in a consultation thread.
   */
  async sendMessage(consultationId: string, payload: MessagePayload): Promise<ApiResponse<MessageResponse>> {
    const response = await apiClient.post(`${API_ENDPOINTS.CONSULTATIONS.LIST}/${consultationId}/messages`, payload);
    return response.data;
  },

  /**
   * Mark all messages in a consultation thread as read.
   */
  async markAsRead(consultationId: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post(`${API_ENDPOINTS.CONSULTATIONS.LIST}/${consultationId}/messages/read`);
    return response.data;
  },
};
