
/**
 * Centralized HTTP client for API requests
 */
import { API_TIMEOUT, API_BASE_URL } from '@/config/apiConfig';
import { getAuthHeader } from '@/utils/authUtils';

// Add flag to track if we're in demo mode (no server)
let isDemoMode = false;

/**
 * Types for API responses
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
 * Options for requests
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  body?: any;
  params?: Record<string, any>; 
  mode?: 'cors' | 'no-cors' | 'same-origin';
}

/**
 * HTTP client with methods to interact with the API
 */
export const httpClient = {
  /**
   * Helper function for making requests
   */
  async request(
    endpoint: string,
    method: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse> {
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
    
    // Use specified timeout or default
    const requestTimeout = options.timeout || API_TIMEOUT;

    // Configure timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log(`Requisição para ${url} abortada após ${requestTimeout}ms`);
    }, requestTimeout);

    try {
      // Handle URL params if present
      let finalUrl = url;
      if (options.params) {
        const queryParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
        
        const queryString = queryParams.toString();
        if (queryString) {
          finalUrl += (url.includes('?') ? '&' : '?') + queryString;
        }
      }

      // If we already detected demo mode, skip actual network request
      if (isDemoMode && endpoint.includes('/api/')) {
        clearTimeout(timeoutId);
        console.log('📱 Demo mode active - using mock response for:', endpoint);
        return this.getMockResponse(endpoint, method, options.body);
      }

      console.log(`Making ${method} request to: ${finalUrl}`);
      
      // Measure request time
      const startTime = performance.now();
      
      // Explicitly set mode to 'cors' by default
      const mode = options.mode || 'cors';
      
      const response = await fetch(finalUrl, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal,
        mode,
        credentials: 'same-origin'
      });

      const endTime = performance.now();
      const requestTime = Math.round(endTime - startTime);
      console.log(`Resposta recebida de ${finalUrl} em ${requestTime}ms com status ${response.status}`);
      
      clearTimeout(timeoutId);

      let data = null;
      let error = null;

      // Try to parse the response as JSON
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

      // If not successful, prepare the error object
      if (!response.ok) {
        error = {
          message: data?.message || data?.error || 'Ocorreu um erro na requisição',
          code: data?.code,
          details: data?.details,
        };
        data = null;
        console.error(`Erro na requisição para ${finalUrl}:`, error);
      }

      return {
        data,
        error,
        status: response.status,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      
      // Check specifically for CORS errors
      const isCORSError = 
        err.message?.includes('NetworkError') || 
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('Network request failed') ||
        err.message?.includes('CORS');
      
      // Log detailed connection error
      console.error(`Erro na conexão com ${url}:`, {
        message: err.message,
        name: err.name,
        stack: err.stack,
        endpoint,
        method,
        isCORSError
      });
      
      // Run a CORS diagnostic
      if (isCORSError) {
        this.runCORSDiagnostic(url);
      }
      
      // If connection refused, switch to demo mode
      if (err.name === 'AbortError') {
        console.warn(`⚠️ Requisição excedeu o tempo limite de ${requestTimeout}ms para: ${url}`);
      } else if (isCORSError) {
        console.warn(`⚠️ Possível erro de CORS ao acessar ${url}, ativando modo demo`);
        console.warn(`⚠️ API server não está disponível em ${url}, ativando modo demo`);
        isDemoMode = true;
        
        // Return a mock response
        if (endpoint.includes('/api/')) {
          return this.getMockResponse(endpoint, method, options.body);
        }
      }
      
      // Handle network or timeout errors
      return {
        data: null,
        error: {
          message: err.name === 'AbortError'
            ? 'A requisição excedeu o tempo limite'
            : isCORSError
              ? `Erro de CORS: Falha no acesso cross-origin a ${API_BASE_URL}. Verifique se o servidor permite solicitações de ${window.location.origin}`
              : err.message || 'Falha de conexão com o servidor',
          code: err.name === 'AbortError' 
            ? 'TIMEOUT' 
            : isCORSError 
              ? 'CORS_ERROR' 
              : 'CONNECTION_ERROR',
        },
        status: err.name === 'AbortError' ? 408 : 0, // 408 Request Timeout
      };
    }
  },

  /**
   * Run a CORS diagnostic test
   */
  async runCORSDiagnostic(url: string) {
    console.log('🔍 Executando diagnóstico de CORS...');
    
    try {
      // Try a simple HEAD request to check basic connectivity
      const response = await fetch(`${API_BASE_URL}/api/cors-test`, {
        method: 'HEAD',
        mode: 'no-cors' // Use no-cors mode to at least see if the server is responding
      });
      
      console.log('✅ Servidor respondeu a requisição no-cors: ', response.type);
      
      console.log('Diagnóstico CORS:');
      console.log(`- URL da API: ${API_BASE_URL}`);
      console.log(`- Origem atual: ${window.location.origin}`);
      console.log(`- Protocolo: ${window.location.protocol}`);
      console.log('- Sugestão: Verifique se o servidor está configurado para aceitar requisições CORS dessa origem');
    } catch (err) {
      console.error('❌ Falha no diagnóstico de CORS:', err);
    }
  },

  /**
   * Generate mock responses for demo mode when server is not available
   */
  getMockResponse(endpoint: string, method: string, body: any): ApiResponse {
    console.log(`📱 Generating mock response for ${method} ${endpoint}`);
    
    // Login endpoint
    if (endpoint.includes('/api/auth/login') && method === 'POST') {
      const mockUser = {
        id: 'demo-user-123',
        email: body?.email || 'demo@example.com',
        user_metadata: {
          nome: 'Usuário',
          sobrenome: 'Demo'
        }
      };
      
      return {
        data: {
          user: mockUser,
          session: {
            access_token: 'demo-token-' + Math.random().toString(36).substring(2),
          }
        },
        error: null,
        status: 200
      };
    }
    
    // Register endpoint
    if (endpoint.includes('/api/auth/register') && method === 'POST') {
      const mockUser = {
        id: 'demo-user-' + Math.random().toString(36).substring(2),
        email: body?.email || 'demo@example.com',
        user_metadata: {
          nome: body?.nome || 'Novo',
          sobrenome: body?.sobrenome || 'Usuário'
        }
      };
      
      return {
        data: {
          user: mockUser,
          session: {
            access_token: 'demo-token-' + Math.random().toString(36).substring(2),
          }
        },
        error: null,
        status: 201
      };
    }
    
    // Health check endpoint
    if (endpoint.includes('/api/check-connection') && method === 'GET') {
      return {
        data: { status: 'ok', message: 'Demo mode: API connection simulated successfully' },
        error: null,
        status: 200
      };
    }
    
    // Restaurants endpoint
    if (endpoint.includes('/api/restaurants') && method === 'GET') {
      return {
        data: {
          restaurants: Array.from({ length: 8 }, (_, i) => ({
            id: `demo-rest-${i}`,
            name: `Restaurante Demo ${i + 1}`,
            cuisine: ['Italiana', 'Japonesa', 'Brasileira', 'Fast Food'][i % 4],
            rating: Math.floor(Math.random() * 5) + 1,
            imageUrl: `https://source.unsplash.com/random/300x200/?restaurant,${i}`,
            deliveryTime: `${Math.floor(Math.random() * 30) + 15}-${Math.floor(Math.random() * 20) + 30} min`,
            deliveryFee: Math.floor(Math.random() * 8) + 3,
          }))
        },
        error: null,
        status: 200
      };
    }
    
    // Default response
    return {
      data: { message: 'Resposta demo gerada para ' + endpoint },
      error: null,
      status: 200
    };
  },

  /**
   * GET request
   */
  async get(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse> {
    return this.request(endpoint, 'GET', options);
  },

  /**
   * POST request
   */
  async post(endpoint: string, data: any = {}, options: RequestOptions = {}): Promise<ApiResponse> {
    return this.request(endpoint, 'POST', {
      ...options,
      body: data,
    });
  },

  /**
   * PUT request
   */
  async put(endpoint: string, data: any = {}, options: RequestOptions = {}): Promise<ApiResponse> {
    return this.request(endpoint, 'PUT', {
      ...options,
      body: data,
    });
  },

  /**
   * PATCH request
   */
  async patch(endpoint: string, data: any = {}, options: RequestOptions = {}): Promise<ApiResponse> {
    return this.request(endpoint, 'PATCH', {
      ...options,
      body: data,
    });
  },

  /**
   * DELETE request
   */
  async delete(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse> {
    return this.request(endpoint, 'DELETE', options);
  },
};
