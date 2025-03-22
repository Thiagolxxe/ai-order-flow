
import React, { useState } from 'react';

interface RestaurantImageProps {
  imageUrl: string;
  name: string;
  defaultImage: string;
}

const RestaurantImage: React.FC<RestaurantImageProps> = ({ imageUrl, name, defaultImage }) => {
  const [currentImage, setCurrentImage] = useState(imageUrl);

  const handleImageError = () => {
    if (currentImage !== defaultImage) {
      console.error("Image failed to load:", currentImage);
      setCurrentImage(defaultImage);
    }
  };

  return (
    <div className="w-full h-64 relative rounded-md overflow-hidden">
      <img
        src={currentImage}
        alt={name}
        className="w-full h-full object-cover"
        onError={handleImageError}
      />
    </div>
  );
};

export default RestaurantImage;
