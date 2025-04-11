
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

// Adicionar tipos faltantes
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: Date;
  userId: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
  createdAt: Date;
  addresses?: Address[];
}

export interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean;
  userId: string;
}

export interface VideoComment {
  id: string;
  text: string;
  userId: string;
  username: string;
  videoId: string;
  createdAt: Date;
}

export interface VideoLike {
  id: string;
  userId: string;
  videoId: string;
  createdAt: Date;
}

export interface VideoShare {
  id: string;
  userId: string;
  videoId: string;
  platform: string;
  createdAt: Date;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  restaurantId: string;
  restaurantName?: string;
  createdAt: Date;
  duration?: number;
  views: number;
  likes: number;
  shares: number;
  comments: number;
}
