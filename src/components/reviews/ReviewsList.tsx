
import React from 'react';
import ReviewCard from './ReviewCard';

interface Review {
  id: string;
  user: string;
  date: string;
  rating: number;
  comment: string;
  order?: string;
  images?: string[];
  reply?: string;
}

interface ReviewsListProps {
  reviews: Review[];
}

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        {reviews.length} {reviews.length === 1 ? 'Avaliação' : 'Avaliações'}
      </h2>
      
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
};

export default ReviewsList;
