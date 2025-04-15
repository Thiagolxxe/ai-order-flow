
import { httpClient } from '@/utils/httpClient';
import { ApiResult } from '@/services/api/types';

// Configuração de timeout padrão
const DEFAULT_TIMEOUT = 10000; // 10 segundos

/**
 * Base API service with common functionality
 */
export const baseApiService = {
  /**
   * Base GET request
   */
  get: async <T>(endpoint: string, params: any = {}, options = {}): Promise<ApiResult<T>> => {
    try {
      const { data, error } = await httpClient.get(endpoint, { 
        params,
        ...options
      });
      
      if (error) {
        console.debug(`Erro na requisição GET para ${endpoint}:`, error);
        return { 
          error,
          serverError: true,
          message: error.message || 'Erro na requisição'
        };
      }
      
      return { data: data as T };
    } catch (error: any) {
      console.error(`GET ${endpoint} error:`, error);
      
      // Verificar se é um erro de conexão ou timeout
      const isConnectionError = error.message?.includes('Failed to fetch') || 
                              error.message?.includes('NetworkError') ||
                              error.name === 'AbortError';
      
      return { 
        error: { 
          message: error.message || 'Falha na requisição',
          isConnectionError,
          originalError: error
        },
        serverError: true
      };
    }
  },
  
  /**
   * Base POST request
   */
  post: async <T>(endpoint: string, payload: any = {}, options = {}): Promise<ApiResult<T>> => {
    try {
      const { data, error } = await httpClient.post(endpoint, payload, options);
      
      if (error) {
        console.debug(`Erro na requisição POST para ${endpoint}:`, error);
        return { 
          success: false, 
          error,
          serverError: true
        };
      }
      
      return { 
        success: true,
        data: data as T
      };
    } catch (error: any) {
      console.error(`POST ${endpoint} error:`, error);
      
      // Verificar se é um erro de conexão ou timeout
      const isConnectionError = error.message?.includes('Failed to fetch') || 
                              error.message?.includes('NetworkError') ||
                              error.name === 'AbortError';
                              
      return { 
        success: false, 
        error: { 
          message: error.message || 'Falha na requisição',
          isConnectionError,
          originalError: error
        },
        serverError: true
      };
    }
  },
  
  /**
   * Base PATCH request
   */
  patch: async <T>(endpoint: string, payload: any = {}, options = {}): Promise<ApiResult<T>> => {
    try {
      const { data, error } = await httpClient.patch(endpoint, payload, options);
      
      if (error) {
        console.debug(`Erro na requisição PATCH para ${endpoint}:`, error);
        return { 
          success: false, 
          error,
          serverError: true
        };
      }
      
      return { 
        success: true,
        data: data as T
      };
    } catch (error: any) {
      console.error(`PATCH ${endpoint} error:`, error);
      
      // Verificar se é um erro de conexão ou timeout
      const isConnectionError = error.message?.includes('Failed to fetch') || 
                              error.message?.includes('NetworkError') ||
                              error.name === 'AbortError';
                              
      return { 
        success: false, 
        error: { 
          message: error.message || 'Falha na requisição',
          isConnectionError,
          originalError: error 
        },
        serverError: true
      };
    }
  }
};
