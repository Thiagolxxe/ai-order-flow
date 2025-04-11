
/**
 * HTTP client utilities
 */
import { RequestOptions } from './types';

/**
 * Build a URL with query parameters
 */
export const buildUrl = (url: string, params?: Record<string, any>): string => {
  if (!params) return url;
  
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });
  
  const queryString = queryParams.toString();
  if (!queryString) return url;
  
  return url + (url.includes('?') ? '&' : '?') + queryString;
};

/**
 * Create an AbortController for request timeouts
 */
export const createTimeoutController = (timeout: number): { 
  controller: AbortController; 
  timeoutId: number;
} => {
  const controller = new AbortController();
  
  const timeoutId = window.setTimeout(() => {
    controller.abort();
    console.log(`Requisição abortada após ${timeout}ms`);
  }, timeout);
  
  return { controller, timeoutId };
};

/**
 * Measure request performance
 */
export const measureRequestTime = (startTime: number): number => {
  const endTime = performance.now();
  return Math.round(endTime - startTime);
};

/**
 * Process response based on status and content type
 */
export const processResponse = async (response: Response): Promise<any> => {
  if (response.status === 204) return null; // No Content
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  } else {
    return await response.text();
  }
};
