
export interface Video {
  id: string;
  restaurantId: string;
  restaurantName: string;
  dishName: string;
  price: number;
  videoUrl: string;
  thumbnailUrl: string;
  likes: number;
  description: string;
  // Novos campos para analytics e processamento
  duration?: number;
  views?: number;
  encoding?: {
    codec: string;
    bitrate: number;
    format: string;
  };
  fileHash?: string;
}

export interface VideoFeedState {
  activeVideoIndex: number;
  muted: boolean;
  errorState: string | null;
  likedVideos: string[];
}

export interface VideoAnalytics {
  videoId: string;
  watchTime: number;
  completionRate: number;
  engagementScore: number;
  shares: {
    count: number;
    platforms: Record<string, number>;
  };
  likes: number;
  comments: number;
}

export interface VideoPlayerConfig {
  adaptiveBitrate: boolean;
  autoplay: boolean;
  preload: 'none' | 'metadata' | 'auto';
  playbackRate: number;
  loop: boolean;
}
