
/**
 * Video API service
 */
import { apiConfig } from '@/config/apiConfig';
import { baseApiService } from '@/services/api/baseApiService';
import { ApiResult } from './types';

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
  },
  
  likeVideo: async (videoId: string): Promise<ApiResult<{ liked: boolean }>> => {
    return baseApiService.post(
      `${apiConfig.endpoints.videos.getById(videoId)}/like`,
      {}
    );
  },
  
  unlikeVideo: async (videoId: string): Promise<ApiResult<{ liked: boolean }>> => {
    return baseApiService.post(
      `${apiConfig.endpoints.videos.getById(videoId)}/unlike`,
      {}
    );
  },
  
  commentOnVideo: async (videoId: string, comment: string): Promise<ApiResult<{ comment: any }>> => {
    return baseApiService.post(
      `${apiConfig.endpoints.videos.getById(videoId)}/comments`,
      { text: comment }
    );
  },
  
  shareVideo: async (videoId: string, platform: string): Promise<ApiResult<{ shared: boolean }>> => {
    return baseApiService.post(
      `${apiConfig.endpoints.videos.getById(videoId)}/share`,
      { platform }
    );
  },
  
  uploadVideo: async (file: File, metadata: any): Promise<ApiResult<{ video: any }>> => {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('video', file);
    
    // Add metadata as JSON
    formData.append('metadata', JSON.stringify(metadata));
    
    return baseApiService.post(
      apiConfig.endpoints.videos.upload,
      formData
    );
  }
};
