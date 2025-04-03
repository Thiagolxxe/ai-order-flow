
/**
 * Cliente HTTP centralizado para chamadas à API
 */
import { API_BASE_URL } from '@/config/apiConfig';
import { getAuthHeader } from '@/utils/authUtils';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  timeout?: number;
}

interface HttpResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: number;
    details?: any;
  };
  status: number;
}

/**
 * Cliente HTTP para fazer requisições à API
 */
export const httpClient = {
  /**
   * Realiza uma requisição HTTP genérica
   */
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<HttpResponse<T>> {
    const { params, timeout = 30000, ...fetchOptions } = options;
    
    // Construir URL com parâmetros de consulta se fornecidos
    let url = `${API_BASE_URL}/${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value);
      });
      url += `?${searchParams.toString()}`;
    }
    
    // Adicionar headers padrão e de autenticação
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...(fetchOptions.headers || {})
    };
    
    try {
      // Implementar timeout personalizado
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Tentar parsear o corpo da resposta como JSON
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      if (!response.ok) {
        return {
          error: {
            message: data.error || `Erro ${response.status}`,
            code: response.status,
            details: data
          },
          status: response.status
        };
      }
      
      return {
        data,
        status: response.status
      };
    } catch (error) {
      console.error(`Error requesting ${endpoint}:`, error);
      
      if (error.name === 'AbortError') {
        return {
          error: {
            message: 'A requisição excedeu o tempo limite',
            code: 408
          },
          status: 408
        };
      }
      
      return {
        error: {
          message: error.message || 'Erro na requisição',
          details: error
        },
        status: 500
      };
    }
  },
  
  // Métodos de conveniência para os verbos HTTP comuns
  
  get<T = any>(endpoint: string, options: RequestOptions = {}): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },
  
  post<T = any>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  },
  
  put<T = any>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  },
  
  patch<T = any>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    });
  },
  
  delete<T = any>(endpoint: string, options: RequestOptions = {}): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
};
