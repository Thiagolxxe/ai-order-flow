
/**
 * Video API service
 */
import { apiConfig } from '@/config/apiConfig';
import { baseApiService } from '@/services/api/baseApiService';
import { 
  ApiResult, 
  Video, 
  VideoComment, 
  PaginatedResponse, 
  VideoEngagement,
  SocialShareMetadata,
  VideoProcessingJob
} from './types';

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
  shareVideo: async (videoId: string, platform: string, metadata?: any): Promise<ApiResult<{ shared: boolean }>> => {
    return baseApiService.post(
      apiConfig.endpoints.videos.share(videoId),
      { platform, metadata }
    );
  },
  
  /**
   * Generate share metadata for social platforms
   */
  generateShareMetadata: async (videoId: string, platform: string): Promise<ApiResult<SocialShareMetadata>> => {
    return baseApiService.get(
      `${apiConfig.endpoints.videos.base}/${videoId}/share-metadata`,
      { platform }
    );
  },
  
  /**
   * Upload a video file with enhanced metadata
   */
  uploadVideo: async (file: File, metadata: any): Promise<ApiResult<VideoProcessingJob>> => {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('video', file);
    
    // Add file hash for deduplication
    const fileHash = await computeFileHash(file);
    formData.append('fileHash', fileHash);
    
    // Add metadata as JSON
    formData.append('metadata', JSON.stringify({
      ...metadata,
      fileSize: file.size,
      originalFilename: file.name,
      contentType: file.type,
      uploadTimestamp: new Date().toISOString()
    }));
    
    // Use the httpClient directly for file uploads
    return baseApiService.post(
      apiConfig.endpoints.videos.upload,
      formData
    );
  },
  
  /**
   * Get video processing status
   */
  getProcessingStatus: async (jobId: string): Promise<ApiResult<VideoProcessingJob>> => {
    return baseApiService.get(
      `${apiConfig.endpoints.videos.base}/processing/${jobId}`
    );
  },
  
  /**
   * Get video engagement analytics
   */
  getVideoEngagement: async (videoId: string): Promise<ApiResult<VideoEngagement>> => {
    return baseApiService.get(
      `${apiConfig.endpoints.videos.base}/${videoId}/analytics/engagement`
    );
  },
  
  /**
   * Report watch progress (for heatmap generation)
   */
  reportWatchProgress: async (videoId: string, progress: number, timestamp: number): Promise<ApiResult<void>> => {
    return baseApiService.post(
      `${apiConfig.endpoints.videos.base}/${videoId}/watch-progress`,
      { progress, timestamp }
    );
  }
};

/**
 * Compute SHA-256 hash of file for deduplication
 */
async function computeFileHash(file: File): Promise<string> {
  return new Promise((resolve) => {
    // In a real implementation, this would use Web Crypto API to generate a SHA-256 hash
    // For now, we'll simulate this with a timestamp + random string
    const randomId = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now().toString(36);
    const simulatedHash = `${timestamp}-${randomId}`;
    resolve(simulatedHash);
  });
}
