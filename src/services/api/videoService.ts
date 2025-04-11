
/**
 * Video API service
 */
import { apiConfig } from '@/config/apiConfig';
import { baseApiService } from '@/services/api/baseApiService';

export const videoService = {
  getAll: async (params: any = {}) => {
    return baseApiService.get(
      apiConfig.endpoints.videos.base,
      params
    );
  },
  
  getById: async (id: string) => {
    return baseApiService.get(
      apiConfig.endpoints.videos.getById(id)
    );
  },
  
  create: async (videoData: any) => {
    return baseApiService.post(
      apiConfig.endpoints.videos.base,
      videoData
    );
  }
};
