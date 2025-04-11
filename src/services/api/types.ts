
/**
 * API service types
 */

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ApiResult<T = any> {
  data?: T;
  error?: ApiError;
  success?: boolean;
  status?: number;
}

export interface AuthSignUpParams {
  email: string;
  password: string;
  options?: {
    data?: {
      nome?: string;
      sobrenome?: string;
      [key: string]: any;
    }
  };
  [key: string]: any;
}

export interface AuthSignInParams {
  email: string;
  password: string;
}

export interface Pagination {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}
