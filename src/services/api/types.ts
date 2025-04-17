
export interface ApiError {
  message?: string;
  code?: string;
  details?: any;
  isConnectionError?: boolean;
  originalError?: any;
}

export interface ApiResult<T> {
  data?: T;
  error?: ApiError;
  success?: boolean;
  message?: string;
  serverError?: boolean;
}

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    nome?: string;
    sobrenome?: string;
    [key: string]: any;
  };
}

export interface UserSession {
  id: string;
  access_token: string;
  expires_at?: string;
  refresh_token?: string;
  user?: User;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AuthSignInParams {
  email: string;
  password: string;
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
}

export interface Video {
  id: string;
  restaurantId: string; 
  restaurantName: string;
  dishName: string;
  price: number;
  videoUrl: string;
  thumbnailUrl?: string;
  likes: number;
  description: string;
}

export interface VideoComment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface VideoEngagement {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  completionRate: number;
  averageWatchTime: number;
}

export interface SocialShareMetadata {
  platform: string;
  url: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface VideoProcessingJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  videoId?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// Adicionando interfaces que faltavam e estavam causando erros

export interface Notification {
  id: string;
  _id?: string;
  userId?: string;
  title?: string;
  titulo?: string;
  message?: string;
  mensagem?: string;
  type?: string;
  tipo?: string;
  read?: boolean;
  lida?: boolean;
  createdAt: string;
  criado_em?: string;
  link?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  lastName: string;
  phone?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  preferences?: {
    theme?: string;
    notifications?: boolean;
    language?: string;
    [key: string]: any;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  id: string;
  userId: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean;
  label?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updatedAt?: string;
}
