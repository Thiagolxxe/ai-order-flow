
export interface Review {
  id: string;
  user: string;
  date: string;
  rating: number;
  comment: string;
  order?: string;
  images?: string[];
  reply?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  avgRating: number;
  totalReviews: number;
}

export interface RatingDistribution {
  [key: number]: number;
}

export interface ReviewFormData {
  rating: number;
  comment: string;
  date: string;
}
