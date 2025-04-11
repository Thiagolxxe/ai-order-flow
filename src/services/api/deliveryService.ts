
/**
 * Delivery API service
 */
import { apiConfig } from '@/config/apiConfig';
import { baseApiService } from '@/services/api/baseApiService';

export const deliveryService = {
  register: async (deliveryData: any) => {
    return baseApiService.post(
      apiConfig.endpoints.delivery.register, 
      deliveryData
    );
  },
  
  getProfile: async () => {
    return baseApiService.get(
      apiConfig.endpoints.delivery.profile
    );
  }
};
