
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

// User profile types
export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  [key: string]: any;
}

// Notification types
export interface Notification {
  _id: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  lida: boolean;
  usuario_id: string;
  criado_em: Date | string;
}

// Address types
export interface Address {
  id: string;
  label?: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  [key: string]: any;
}
