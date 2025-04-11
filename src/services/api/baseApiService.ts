
import { httpClient } from '@/utils/httpClient';
import { ApiResult } from '@/services/api/types';

/**
 * Base API service with common functionality
 */
export const baseApiService = {
  /**
   * Base GET request
   */
  get: async <T>(endpoint: string, params: any = {}): Promise<ApiResult<T>> => {
    try {
      const { data, error } = await httpClient.get(endpoint, { params });
      
      if (error) {
        return { error };
      }
      
      return { data: data as T };
    } catch (error: any) {
      console.error(`GET ${endpoint} error:`, error);
      return { error: { message: error.message || 'Request failed' } };
    }
  },
  
  /**
   * Base POST request
   */
  post: async <T>(endpoint: string, payload: any = {}): Promise<ApiResult<T>> => {
    try {
      const { data, error } = await httpClient.post(endpoint, payload);
      
      if (error) {
        return { 
          success: false, 
          error
        };
      }
      
      return { 
        success: true,
        data: data as T
      };
    } catch (error: any) {
      console.error(`POST ${endpoint} error:`, error);
      return { 
        success: false, 
        error: { message: error.message || 'Request failed' }
      };
    }
  },
  
  /**
   * Base PATCH request
   */
  patch: async <T>(endpoint: string, payload: any = {}): Promise<ApiResult<T>> => {
    try {
      const { data, error } = await httpClient.patch(endpoint, payload);
      
      if (error) {
        return { 
          success: false, 
          error
        };
      }
      
      return { 
        success: true,
        data: data as T
      };
    } catch (error: any) {
      console.error(`PATCH ${endpoint} error:`, error);
      return { 
        success: false, 
        error: { message: error.message || 'Request failed' }
      };
    }
  }
};
