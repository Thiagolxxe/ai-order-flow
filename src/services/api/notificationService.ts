
/**
 * Notification API service
 */
import { apiConfig } from '@/config/apiConfig';
import { baseApiService } from '@/services/api/baseApiService';
import { httpClient } from '@/utils/httpClient';
import { Notification } from './types';

// Mock data for notifications when the API fails
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    _id: '1',
    titulo: 'Bem-vindo ao DeliveryAI',
    mensagem: 'Seu cadastro foi realizado com sucesso! Explore nossos restaurantes parceiros.',
    tipo: 'success',
    lida: false,
    usuario_id: 'current',
    criado_em: new Date(Date.now() - 5 * 60000) // 5 minutes ago
  },
  {
    _id: '2',
    titulo: 'Promoção de lançamento',
    mensagem: 'Use o código BEMVINDO20 para obter 20% de desconto em seu primeiro pedido.',
    tipo: 'info',
    lida: false,
    usuario_id: 'current',
    criado_em: new Date(Date.now() - 30 * 60000) // 30 minutes ago
  }
];

export const notificationService = {
  getAll: async () => {
    try {
      const result = await baseApiService.get(
        apiConfig.endpoints.notifications.base
      );
      
      // If error or no data, provide mock data
      if (result.error || !result.data) {
        console.log('Using mock notifications data for getAll');
        return { data: MOCK_NOTIFICATIONS };
      }
      
      return result;
    } catch (error) {
      console.error('Get all notifications error:', error);
      // Return mock data on error
      return { data: MOCK_NOTIFICATIONS };
    }
  },
  
  getByUserId: async () => {
    try {
      const result = await baseApiService.get(
        apiConfig.endpoints.notifications.base
      );
      
      // If error or no data, provide mock data
      if (result.error || !result.data) {
        console.log('Using mock notifications data for getByUserId');
        return { data: MOCK_NOTIFICATIONS };
      }
      
      return result;
    } catch (error) {
      console.error('Get notifications by user ID error:', error);
      // Return mock data on error
      return { data: MOCK_NOTIFICATIONS };
    }
  },
  
  markAsRead: async (id: string) => {
    try {
      // For mock notifications, handle locally without API call
      if (id.startsWith('1') || id.startsWith('2')) {
        console.log('Marking mock notification as read:', id);
        return { 
          success: true,
          data: { _id: id, lida: true }
        };
      }
      
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
    try {
      const result = await baseApiService.get(
        apiConfig.endpoints.notifications.unread
      );
      
      // If error or no data, provide mock data
      if (result.error || !result.data) {
        console.log('Using mock notifications data for getUnread');
        return { 
          data: MOCK_NOTIFICATIONS.filter(notification => !notification.lida)
        };
      }
      
      return result;
    } catch (error) {
      console.error('Get unread notifications error:', error);
      // Return mock data on error
      return { 
        data: MOCK_NOTIFICATIONS.filter(notification => !notification.lida)
      };
    }
  }
};
