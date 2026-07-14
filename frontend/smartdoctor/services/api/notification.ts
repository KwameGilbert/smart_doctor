import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { ApiResponse } from "./auth";

export interface NotificationItem {
  id: string;
  type: "ai" | "appointment" | "record" | "reminder";
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  /**
   * Fetch all notifications for the current authenticated user.
   */
  async list(): Promise<ApiResponse<NotificationItem[]>> {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
    return response.data;
  },

  /**
   * Mark a single notification as read.
   */
  async markAsRead(id: string): Promise<ApiResponse<NotificationItem>> {
    const response = await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.READ(id));
    return response.data;
  },

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead(): Promise<ApiResponse<null>> {
    const response = await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
    return response.data;
  },

  /**
   * Delete a single notification by ID.
   */
  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
    return response.data;
  },

  /**
   * Delete all notifications for the current user.
   */
  async clearAll(): Promise<ApiResponse<null>> {
    const response = await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.CLEAR_ALL);
    return response.data;
  },
};
