
import React from 'react';

interface RestaurantImageProps {
  imageUrl: string;
  name: string;
  defaultImage: string;
}

const RestaurantImage: React.FC<RestaurantImageProps> = ({ imageUrl, name, defaultImage }) => {
  return (
    <div className="w-full h-64 relative rounded-md overflow-hidden">
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error("Image failed to load:", imageUrl);
          // If the image fails to load, replace with default image
          const target = e.target as HTMLImageElement;
          target.onerror = null; // Prevent infinite loop
          target.src = defaultImage;
        }}
      />
    </div>
  );
};

export default RestaurantImage;
