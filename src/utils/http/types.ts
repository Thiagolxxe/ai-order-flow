
/**
 * Types for HTTP client API responses and requests
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
  params?: Record<string, string | number | boolean | undefined>; 
  mode?: 'cors' | 'no-cors' | 'same-origin';
}
