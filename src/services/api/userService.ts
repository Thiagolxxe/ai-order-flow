
/**
 * User API service
 */
import { apiConfig } from '@/config/apiConfig';
import { baseApiService } from '@/services/api/baseApiService';

export const userService = {
  getProfile: async () => {
    return baseApiService.get(
      apiConfig.endpoints.users.profile
    );
  },
  
  updateProfile: async (profileData: any) => {
    return baseApiService.patch(
      apiConfig.endpoints.users.updateProfile,
      profileData
    );
  }
};
