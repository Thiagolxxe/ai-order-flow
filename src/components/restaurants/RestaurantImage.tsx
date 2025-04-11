
import React from 'react';
import ImageWithFallback from '@/components/ui/image-with-fallback';

interface RestaurantImageProps {
  imageUrl: string;
  name: string;
  defaultImage: string;
}

const RestaurantImage: React.FC<RestaurantImageProps> = ({ imageUrl, name, defaultImage }) => {
  return (
    <div className="w-full h-64 relative rounded-md overflow-hidden">
      <ImageWithFallback
        src={imageUrl}
        fallbackSrc={defaultImage}
        alt={name}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default RestaurantImage;
