
/**
 * Notification API service
 */
import { apiConfig } from '@/config/apiConfig';
import { baseApiService } from '@/services/api/baseApiService';
import { Notification, ApiResult, PaginatedResponse } from '@/services/api/types';

export const notificationService = {
  /**
   * Get all notifications for the current user
   */
  getAll: async (params: any = {}): Promise<ApiResult<PaginatedResponse<Notification>>> => {
    return baseApiService.get(
      apiConfig.endpoints.notifications.base,
      params
    );
  },
  
  /**
   * Get notifications by user ID
   */
  getByUserId: async (userId: string, params: any = {}): Promise<ApiResult<PaginatedResponse<Notification>>> => {
    return baseApiService.get(
      `${apiConfig.endpoints.notifications.base}/user/${userId}`,
      params
    );
  },
  
  /**
   * Get unread notifications count
   */
  getUnreadCount: async (): Promise<ApiResult<{ count: number }>> => {
    return baseApiService.get(
      apiConfig.endpoints.notifications.unread
    );
  },
  
  /**
   * Get unread notifications 
   */
  getUnread: async (): Promise<ApiResult<Notification[]>> => {
    return baseApiService.get(
      `${apiConfig.endpoints.notifications.base}/unread`
    );
  },
  
  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: string): Promise<ApiResult<Notification>> => {
    return baseApiService.post(
      apiConfig.endpoints.notifications.markAsRead(notificationId),
      { read: true }
    );
  },
  
  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<ApiResult<{ success: boolean }>> => {
    return baseApiService.post(
      `${apiConfig.endpoints.notifications.base}/mark-all-read`,
      {}
    );
  },
  
  /**
   * Delete notification
   */
  delete: async (notificationId: string): Promise<ApiResult<{ success: boolean }>> => {
    return baseApiService.post(
      `${apiConfig.endpoints.notifications.base}/delete/${notificationId}`,
      {}
    );
  }
};
