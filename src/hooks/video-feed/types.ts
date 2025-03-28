
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
}

export interface VideoFeedState {
  activeVideoIndex: number;
  muted: boolean;
  errorState: string | null;
  likedVideos: string[];
}

