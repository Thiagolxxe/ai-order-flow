
/**
 * Cliente HTTP centralizado para requisições à API
 */
import { API_TIMEOUT, API_BASE_URL } from '@/config/apiConfig';
import { getAuthHeader } from '@/utils/authUtils';

/**
 * Tipos para responses da API
 */
export interface ApiResponse<T = any> {
  data: T | null;
  error: ApiError | null;
  status: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Opções para requisições
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  body?: any;
}

/**
 * Cliente HTTP com métodos para interagir com a API
 */
export const httpClient = {
  /**
   * Função auxiliar para fazer requisições
   */
  async request<T>(
    endpoint: string,
    method: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${API_BASE_URL}/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;

    const authHeaders = getAuthHeader();
    
    const headers = {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    };

    const controller = new AbortController();
    const { signal } = controller;

    // Configura timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, options.timeout || API_TIMEOUT);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal,
      });

      clearTimeout(timeoutId);

      let data = null;
      let error = null;

      // Tenta parsear o response como JSON
      try {
        if (response.status !== 204) { // No Content
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
          } else {
            data = await response.text();
          }
        }
      } catch (e) {
        console.error('Error parsing response:', e);
      }

      // Se não for sucesso, prepara o objeto de erro
      if (!response.ok) {
        error = {
          message: data?.message || data?.error || 'Ocorreu um erro na requisição',
          code: data?.code,
          details: data?.details,
        };
        data = null;
      }

      return {
        data,
        error,
        status: response.status,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      
      // Trata erros de rede ou timeout
      return {
        data: null,
        error: {
          message: err.name === 'AbortError'
            ? 'A requisição excedeu o tempo limite'
            : err.message || 'Falha de conexão com o servidor',
        },
        status: err.name === 'AbortError' ? 408 : 0, // 408 Request Timeout
      };
    }
  },

  /**
   * GET request
   */
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', options);
  },

  /**
   * POST request
   */
  async post<T>(endpoint: string, data: any = {}, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', {
      ...options,
      body: data,
    });
  },

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data: any = {}, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', {
      ...options,
      body: data,
    });
  },

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data: any = {}, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', {
      ...options,
      body: data,
    });
  },

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', options);
  },
};
