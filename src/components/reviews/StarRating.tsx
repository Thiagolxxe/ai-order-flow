
import React from 'react';
import { StarIcon } from '@/assets/icons';

interface StarRatingProps {
  rating: number;
  setRating?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'default' | 'small' | 'large';
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  setRating,
  readOnly = false,
  size = 'default'
}) => {
  const handleSetRating = (value: number) => {
    if (!readOnly && setRating) {
      setRating(value);
    }
  };

  const sizeClass = {
    small: 'w-3 h-3',
    default: 'w-5 h-5',
    large: 'w-7 h-7'
  };

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleSetRating(star)}
          className={`${!readOnly ? 'cursor-pointer' : 'cursor-default'} focus:outline-none`}
          disabled={readOnly}
        >
          <StarIcon
            className={`${
              star <= rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300 dark:text-gray-600'
            } ${sizeClass[size]}`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
