
/**
 * Order API service
 */
import { apiConfig } from '@/config/apiConfig';
import { baseApiService } from '@/services/api/baseApiService';
import { httpClient } from '@/utils/httpClient';

export const orderService = {
  create: async (orderData: any) => {
    return baseApiService.post(
      apiConfig.endpoints.orders.create,
      orderData
    );
  },
  
  getByUser: async () => {
    return baseApiService.get(
      apiConfig.endpoints.orders.getByUser
    );
  },
  
  getById: async (id: string) => {
    return baseApiService.get(
      apiConfig.endpoints.orders.getById(id)
    );
  },
  
  updateStatus: async (id: string, status: string) => {
    try {
      const { data, error } = await httpClient.patch(
        apiConfig.endpoints.orders.updateStatus(id),
        { status }
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
      console.error('Update order status error:', error);
      return { 
        success: false, 
        error: { message: error.message || 'Falha ao atualizar status do pedido' }
      };
    }
  }
};
