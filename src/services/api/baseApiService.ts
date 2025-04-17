
import { httpClient } from '@/utils/httpClient';
import { ApiResult } from '@/services/api/types';

// Configuração de timeout padrão
const DEFAULT_TIMEOUT = 10000; // 10 segundos

// Lista de códigos de erro HTTP
const HTTP_ERROR_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Códigos de erro personalizados
const ERROR_CODES = {
  TIMEOUT: 'TIMEOUT_ERROR',
  NETWORK: 'NETWORK_ERROR',
  API: 'API_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

/**
 * Base API service with common functionality and error handling
 */
export const baseApiService = {
  /**
   * Base GET request
   */
  get: async <T>(endpoint: string, params: any = {}, options = {}): Promise<ApiResult<T>> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || DEFAULT_TIMEOUT);
      
      const { data, error, status } = await httpClient.get(endpoint, { 
        params,
        signal: controller.signal,
        ...options
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.debug(`Erro na requisição GET para ${endpoint}:`, error);
        
        // Verificar se é um erro de servidor
        const isServerError = status >= 500;
        
        return { 
          error,
          success: false,
          message: error.message || 'Erro na requisição',
          serverError: isServerError
        };
      }
      
      return { data: data as T, success: true };
    } catch (error: any) {
      console.error(`GET ${endpoint} error:`, error);
      
      // Verificar se é um erro de conexão, timeout ou abortamento
      const isConnectionError = 
        error.message?.includes('Failed to fetch') || 
        error.message?.includes('NetworkError') ||
        error.name === 'AbortError' ||
        !navigator.onLine;
      
      // Verificar se é um timeout
      const isTimeout = error.name === 'AbortError' && error.message?.includes('timeout');
      
      const errorCode = isTimeout 
        ? ERROR_CODES.TIMEOUT 
        : isConnectionError 
          ? ERROR_CODES.NETWORK 
          : ERROR_CODES.UNKNOWN;
      
      return { 
        success: false,
        error: { 
          message: isTimeout 
            ? 'Tempo limite da requisição excedido'
            : isConnectionError 
              ? 'Erro de conexão. Verifique sua internet.' 
              : error.message || 'Falha na requisição',
          code: errorCode,
          isConnectionError,
          originalError: error
        }
      };
    }
  },
  
  /**
   * Base POST request with improved error handling
   */
  post: async <T>(endpoint: string, payload: any = {}, options = {}): Promise<ApiResult<T>> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || DEFAULT_TIMEOUT);
      
      const { data, error, status } = await httpClient.post(endpoint, payload, {
        signal: controller.signal,
        ...options
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.debug(`Erro na requisição POST para ${endpoint}:`, error);
        
        // Verificar se é um erro de servidor
        const isServerError = status >= 500;
        
        return { 
          success: false, 
          error,
          serverError: isServerError
        };
      }
      
      return { 
        success: true,
        data: data as T
      };
    } catch (error: any) {
      console.error(`POST ${endpoint} error:`, error);
      
      // Verificar se é um erro de conexão, timeout ou abortamento
      const isConnectionError = 
        error.message?.includes('Failed to fetch') || 
        error.message?.includes('NetworkError') ||
        error.name === 'AbortError' ||
        !navigator.onLine;
      
      // Verificar se é um timeout
      const isTimeout = error.name === 'AbortError' && error.message?.includes('timeout');
      
      const errorCode = isTimeout 
        ? ERROR_CODES.TIMEOUT 
        : isConnectionError 
          ? ERROR_CODES.NETWORK 
          : ERROR_CODES.UNKNOWN;
      
      return { 
        success: false, 
        error: { 
          message: isTimeout 
            ? 'Tempo limite da requisição excedido'
            : isConnectionError 
              ? 'Erro de conexão. Verifique sua internet.' 
              : error.message || 'Falha na requisição',
          code: errorCode,
          isConnectionError,
          originalError: error 
        }
      };
    }
  },
  
  /**
   * Base PATCH request with improved error handling
   */
  patch: async <T>(endpoint: string, payload: any = {}, options = {}): Promise<ApiResult<T>> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || DEFAULT_TIMEOUT);
      
      const { data, error, status } = await httpClient.patch(endpoint, payload, {
        signal: controller.signal,
        ...options
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.debug(`Erro na requisição PATCH para ${endpoint}:`, error);
        
        // Verificar se é um erro de servidor
        const isServerError = status >= 500;
        
        return { 
          success: false, 
          error,
          serverError: isServerError
        };
      }
      
      return { 
        success: true,
        data: data as T
      };
    } catch (error: any) {
      console.error(`PATCH ${endpoint} error:`, error);
      
      // Verificar se é um erro de conexão, timeout ou abortamento
      const isConnectionError = 
        error.message?.includes('Failed to fetch') || 
        error.message?.includes('NetworkError') ||
        error.name === 'AbortError' ||
        !navigator.onLine;
      
      // Verificar se é um timeout
      const isTimeout = error.name === 'AbortError' && error.message?.includes('timeout');
      
      const errorCode = isTimeout 
        ? ERROR_CODES.TIMEOUT 
        : isConnectionError 
          ? ERROR_CODES.NETWORK 
          : ERROR_CODES.UNKNOWN;
      
      return { 
        success: false, 
        error: { 
          message: isTimeout 
            ? 'Tempo limite da requisição excedido'
            : isConnectionError 
              ? 'Erro de conexão. Verifique sua internet.' 
              : error.message || 'Falha na requisição',
          code: errorCode,
          isConnectionError,
          originalError: error 
        }
      };
    }
  },
  
  /**
   * Base DELETE request (adicionando)
   */
  delete: async <T>(endpoint: string, options = {}): Promise<ApiResult<T>> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || DEFAULT_TIMEOUT);
      
      const { data, error, status } = await httpClient.delete(endpoint, {
        signal: controller.signal,
        ...options
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.debug(`Erro na requisição DELETE para ${endpoint}:`, error);
        
        // Verificar se é um erro de servidor
        const isServerError = status >= 500;
        
        return { 
          success: false, 
          error,
          serverError: isServerError
        };
      }
      
      return { 
        success: true,
        data: data as T
      };
    } catch (error: any) {
      console.error(`DELETE ${endpoint} error:`, error);
      
      // Verificar se é um erro de conexão, timeout ou abortamento
      const isConnectionError = 
        error.message?.includes('Failed to fetch') || 
        error.message?.includes('NetworkError') ||
        error.name === 'AbortError' ||
        !navigator.onLine;
      
      // Verificar se é um timeout
      const isTimeout = error.name === 'AbortError' && error.message?.includes('timeout');
      
      const errorCode = isTimeout 
        ? ERROR_CODES.TIMEOUT 
        : isConnectionError 
          ? ERROR_CODES.NETWORK 
          : ERROR_CODES.UNKNOWN;
      
      return { 
        success: false, 
        error: { 
          message: isTimeout 
            ? 'Tempo limite da requisição excedido'
            : isConnectionError 
              ? 'Erro de conexão. Verifique sua internet.' 
              : error.message || 'Falha na requisição',
          code: errorCode,
          isConnectionError,
          originalError: error 
        }
      };
    }
  }
};
