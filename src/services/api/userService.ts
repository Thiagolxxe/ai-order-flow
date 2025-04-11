
/**
 * User API service
 */
import { apiConfig } from '@/config/apiConfig';
import { baseApiService } from '@/services/api/baseApiService';
import { ApiResult, UserProfile } from '@/services/api/types';

export const userService = {
  getProfile: async (): Promise<ApiResult<UserProfile>> => {
    return baseApiService.get<UserProfile>(
      apiConfig.endpoints.users.profile
    );
  },
  
  updateProfile: async (profileData: Partial<UserProfile>): Promise<ApiResult<UserProfile>> => {
    return baseApiService.patch<UserProfile>(
      apiConfig.endpoints.users.updateProfile,
      profileData
    );
  }
};
