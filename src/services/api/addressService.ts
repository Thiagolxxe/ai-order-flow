
/**
 * Address API service
 */
import { apiConfig } from '@/config/apiConfig';
import { baseApiService } from '@/services/api/baseApiService';

export const addressService = {
  getAll: async () => {
    return baseApiService.get(
      apiConfig.endpoints.addresses.base
    );
  },
  
  create: async (addressData: any) => {
    return baseApiService.post(
      apiConfig.endpoints.addresses.base,
      addressData
    );
  }
};
