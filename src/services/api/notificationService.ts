
/**
 * Notification API service
 */
import { apiConfig } from '@/config/apiConfig';
import { baseApiService } from '@/services/api/baseApiService';
import { httpClient } from '@/utils/httpClient';

export const notificationService = {
  getAll: async () => {
    return baseApiService.get(
      apiConfig.endpoints.notifications.base
    );
  },
  
  getByUserId: async () => {
    return baseApiService.get(
      apiConfig.endpoints.notifications.base
    );
  },
  
  markAsRead: async (id: string) => {
    try {
      const { data, error } = await httpClient.patch(
        apiConfig.endpoints.notifications.markAsRead(id)
      );
      
      if (error) {
        return { 
          success: false, 
          error
        };
      }
      
      return { 
        success: true,
        data
      };
    } catch (error: any) {
      console.error('Mark notification as read error:', error);
      return { 
        success: false, 
        error: { message: error.message || 'Falha ao marcar notificação como lida' }
      };
    }
  },
  
  getUnread: async () => {
    return baseApiService.get(
      apiConfig.endpoints.notifications.unread
    );
  }
};
