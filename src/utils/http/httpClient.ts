
/**
 * Core HTTP client for API requests
 */
import { API_TIMEOUT, API_BASE_URL } from '@/config/apiConfig';
import { getAuthHeader } from '@/utils/authUtils';
import { ApiResponse, RequestOptions } from './types';
import { getMockResponse } from './mockResponses';
import { runCORSDiagnostic, detectConnectionErrorType } from './diagnostics';
import { buildUrl, createTimeoutController, measureRequestTime, processResponse } from './utils';

// Add flag to track if we're in demo mode (no server)
let isDemoMode = false;

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

    // Use specified timeout or default
    const requestTimeout = options.timeout || API_TIMEOUT;
    
    // Setup timeout controller
    const { controller, timeoutId } = createTimeoutController(requestTimeout);
    const { signal } = controller;

    try {
      // Handle URL params if present
      const finalUrl = buildUrl(url, options.params);

      // If we already detected demo mode, skip actual network request
      if (isDemoMode && endpoint.includes('/api/')) {
        clearTimeout(timeoutId);
        console.log('📱 Demo mode active - using mock response for:', endpoint);
        return getMockResponse(endpoint, method, options.body);
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

      const requestTime = measureRequestTime(startTime);
      console.log(`Resposta recebida de ${finalUrl} em ${requestTime}ms com status ${response.status}`);
      
      clearTimeout(timeoutId);

      let data = null;
      let error = null;

      // Try to parse the response as JSON
      try {
        data = await processResponse(response);
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
      
      // Log detailed connection error
      console.error(`Erro na conexão com ${url}:`, {
        message: err.message,
        name: err.name,
        stack: err.stack,
        endpoint,
        method
      });
      
      // Analyze the error
      const { isCORSError, isTimeout, errorCode, errorMessage } = detectConnectionErrorType(err);
      
      // Run a CORS diagnostic
      if (isCORSError) {
        runCORSDiagnostic(url, API_BASE_URL);
      }
      
      // If connection refused or CORS error, switch to demo mode
      if (isTimeout) {
        console.warn(`⚠️ Requisição excedeu o tempo limite de ${requestTimeout}ms para: ${url}`);
      } else if (isCORSError) {
        console.warn(`⚠️ Possível erro de CORS ao acessar ${url}, ativando modo demo`);
        console.warn(`⚠️ API server não está disponível em ${url}, ativando modo demo`);
        isDemoMode = true;
        
        // Return a mock response
        if (endpoint.includes('/api/')) {
          return getMockResponse(endpoint, method, options.body);
        }
      }
      
      // Handle network or timeout errors
      return {
        data: null,
        error: {
          message: errorMessage,
          code: errorCode,
        },
        status: isTimeout ? 408 : 0, // 408 Request Timeout
      };
    }
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
