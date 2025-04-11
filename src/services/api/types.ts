
// Type for API responses
export interface ApiSuccessResponse<T> {
  data: T;
  error?: never;
  success?: boolean;
}

export interface ApiErrorResponse {
  error: { message: string; code?: string; details?: any };
  data?: never;
  success?: boolean;
}

export type ApiResult<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Define types for auth responses
export interface AuthResponse {
  session: {
    user: any;
    [key: string]: any;
  };
}

// Interface for authentication
export interface AuthSignUpParams {
  email: string;
  password: string;
  name?: string;
  lastName?: string;
  phone?: string;
}

export interface AuthSignInParams {
  email: string;
  password: string;
}

// MongoDB Status Types
export type MongoDBConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';
export type ApiConnectionStatus = 'idle' | 'checking' | 'connected' | 'error';
