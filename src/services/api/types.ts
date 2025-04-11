
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
      firstName?: string;
      lastName?: string;
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

export interface Notification {
  id: string;
  _id?: string; // Support for legacy MongoDB ID format
  title: string;
  titulo?: string; // Support for Portuguese naming
  message: string;
  mensagem?: string; // Support for Portuguese naming
  type: 'info' | 'warning' | 'error' | 'success';
  tipo?: 'info' | 'warning' | 'error' | 'success'; // Support for Portuguese naming
  read: boolean;
  lida?: boolean; // Support for Portuguese naming
  createdAt: Date;
  criado_em?: Date; // Support for Portuguese naming
  userId: string;
  usuario_id?: string; // Support for Portuguese naming
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
  // Support for legacy fields
  name?: string;
  address?: string;
  user_metadata?: {
    nome?: string;
    sobrenome?: string;
    [key: string]: any;
  };
}

export interface Address {
  id: string;
  street: string;
  endereco?: string; // Support for Portuguese naming
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  cidade?: string; // Support for Portuguese naming
  state: string;
  estado?: string; // Support for Portuguese naming
  zipCode: string;
  cep?: string; // Support for Portuguese naming
  isDefault?: boolean;
  userId: string;
  label?: string; // Added for UI display purposes
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
  metadata?: {
    shareUrl?: string;
    recipientCount?: number;
    previewImage?: string;
  };
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
  fileHash?: string;
  fileSize?: number;
  resolution?: string;
  encoding?: {
    codec: string;
    bitrate: number;
    format: string;
  };
  moderation?: {
    status: 'pending' | 'approved' | 'rejected';
    reviewedAt?: Date;
    notes?: string;
  };
}

// Content Delivery Types
export interface CDNConfig {
  provider: string;
  region: string;
  bucketName: string;
  publicUrl: string;
}

export interface VideoProcessingJob {
  id: string;
  videoId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  operations: string[];
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

// Analytics Types
export interface VideoEngagement {
  videoId: string;
  viewCompletion: number;
  avgWatchTime: number;
  dropOffPoints: number[];
  heatmapData?: any;
}

// Enhanced Video Sharing Types
export interface SocialShareMetadata {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  ogTags?: Record<string, string>;
  qrCodeUrl?: string;
  utm?: Record<string, string>;
}

