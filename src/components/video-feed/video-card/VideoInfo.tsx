import React from 'react';
import { Button } from '@/components/ui/button';
import { Video } from '@/hooks/video-feed/types';

interface VideoInfoProps {
  video: Video;
  onViewRestaurant: () => void;
}

const VideoInfo = ({ video, onViewRestaurant }: VideoInfoProps) => {
  return (
    <>
      {/* Top info */}
      <div className="absolute top-0 inset-x-0 p-4 text-white z-20">
        <h2 className="font-semibold text-xl drop-shadow-lg">{video.dishName}</h2>
        <p className="text-white/90 text-sm drop-shadow-md">{video.restaurantName}</p>
      </div>
      
      {/* Bottom info */}
      <div className="absolute bottom-20 inset-x-0 px-4 text-white z-20">
        <div className="flex justify-between items-center mb-2">
          <p className="text-lg font-bold">R$ {video.price.toFixed(2).replace('.', ',')}</p>
          <Button 
            variant="outline" 
            className="text-sm rounded-full bg-primary hover:bg-primary/90 text-white border-primary px-4 hover:scale-105 transition-all"
            onClick={onViewRestaurant}
          >
            Ver Restaurante
          </Button>
        </div>
        <p className="text-sm text-white/90 line-clamp-2">{video.description}</p>
      </div>
    </>
  );
};

export default VideoInfo;
