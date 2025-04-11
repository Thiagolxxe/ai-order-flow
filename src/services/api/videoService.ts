
/**
 * Video API service
 */
import { apiConfig } from '@/config/apiConfig';
import { baseApiService } from '@/services/api/baseApiService';
import { ApiResult, Video, VideoComment, PaginatedResponse } from './types';

export const videoService = {
  /**
   * Get all videos with pagination
   */
  getAll: async (params: any = {}): Promise<ApiResult<PaginatedResponse<Video>>> => {
    return baseApiService.get(
      apiConfig.endpoints.videos.base,
      params
    );
  },
  
  /**
   * Get video by ID
   */
  getById: async (id: string): Promise<ApiResult<Video>> => {
    return baseApiService.get(
      apiConfig.endpoints.videos.getById(id)
    );
  },
  
  /**
   * Get trending videos
   */
  getTrending: async (limit: number = 10): Promise<ApiResult<Video[]>> => {
    return baseApiService.get(
      apiConfig.endpoints.videos.trending,
      { limit }
    );
  },
  
  /**
   * Get recommended videos
   */
  getRecommended: async (limit: number = 10): Promise<ApiResult<Video[]>> => {
    return baseApiService.get(
      apiConfig.endpoints.videos.recommended,
      { limit }
    );
  },
  
  /**
   * Get videos by restaurant
   */
  getByRestaurant: async (restaurantId: string, params: any = {}): Promise<ApiResult<PaginatedResponse<Video>>> => {
    return baseApiService.get(
      apiConfig.endpoints.videos.byRestaurant(restaurantId),
      params
    );
  },
  
  /**
   * Create new video
   */
  create: async (videoData: Partial<Video>): Promise<ApiResult<Video>> => {
    return baseApiService.post(
      apiConfig.endpoints.videos.base,
      videoData
    );
  },
  
  /**
   * Like a video
   */
  likeVideo: async (videoId: string): Promise<ApiResult<{ liked: boolean }>> => {
    return baseApiService.post(
      apiConfig.endpoints.videos.like(videoId),
      {}
    );
  },
  
  /**
   * Unlike a video
   */
  unlikeVideo: async (videoId: string): Promise<ApiResult<{ liked: boolean }>> => {
    return baseApiService.post(
      apiConfig.endpoints.videos.unlike(videoId),
      {}
    );
  },
  
  /**
   * Add comment to video
   */
  commentOnVideo: async (videoId: string, text: string): Promise<ApiResult<VideoComment>> => {
    return baseApiService.post(
      apiConfig.endpoints.videos.comment(videoId),
      { text }
    );
  },
  
  /**
   * Get comments for a video
   */
  getVideoComments: async (videoId: string, params: any = {}): Promise<ApiResult<PaginatedResponse<VideoComment>>> => {
    return baseApiService.get(
      apiConfig.endpoints.videos.comment(videoId),
      params
    );
  },
  
  /**
   * Share a video
   */
  shareVideo: async (videoId: string, platform: string): Promise<ApiResult<{ shared: boolean }>> => {
    return baseApiService.post(
      apiConfig.endpoints.videos.share(videoId),
      { platform }
    );
  },
  
  /**
   * Upload a video file
   */
  uploadVideo: async (file: File, metadata: any): Promise<ApiResult<Video>> => {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('video', file);
    
    // Add metadata as JSON
    formData.append('metadata', JSON.stringify(metadata));
    
    // Use the httpClient directly for file uploads
    return baseApiService.post(
      apiConfig.endpoints.videos.upload,
      formData
    );
  }
};
