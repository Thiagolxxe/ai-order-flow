
import React, { useRef, useEffect } from 'react';
import { Heart, Share2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Video {
  id: string;
  restaurantId: string;
  restaurantName: string;
  dishName: string;
  price: number;
  videoUrl: string;
  likes: number;
  description: string;
}

interface VideoCardProps {
  video: Video;
  isActive: boolean;
  muted: boolean;
  onMuteToggle: () => void;
  onViewRestaurant: () => void;
}

const VideoCard = ({ video, isActive, muted, onMuteToggle, onViewRestaurant }: VideoCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Handle video playback based on active state
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isActive) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(err => {
        console.error("Error playing video:", err);
      });
    } else {
      videoRef.current.pause();
    }
  }, [isActive]);
  
  // Update muted state when it changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  return (
    <div className="relative h-full w-full">
      {/* Video */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="absolute inset-0 object-cover w-full h-full"
        playsInline
        loop
        muted={muted}
        onClick={onMuteToggle}
      />
      
      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
      
      {/* Top info */}
      <div className="absolute top-safe inset-x-0 p-4 text-white">
        <h2 className="font-semibold text-xl drop-shadow-lg">{video.dishName}</h2>
        <p className="text-white/90 text-sm drop-shadow-md">{video.restaurantName}</p>
      </div>
      
      {/* Side icons */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-6">
        <div className="flex flex-col items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white w-11 h-11"
          >
            <Heart size={24} />
            <span className="sr-only">Curtir</span>
          </Button>
          <span className="text-white text-xs mt-1 font-medium">{video.likes}</span>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white w-11 h-11"
        >
          <Share2 size={24} />
          <span className="sr-only">Compartilhar</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white w-11 h-11"
          onClick={onViewRestaurant}
        >
          <Info size={24} />
          <span className="sr-only">Informações</span>
        </Button>
      </div>
      
      {/* Bottom info */}
      <div className="absolute bottom-safe inset-x-0 p-4 text-white">
        <div className="flex justify-between items-center mb-2">
          <p className="text-lg font-bold">R$ {video.price.toFixed(2)}</p>
          <Button 
            variant="outline" 
            className="text-sm rounded-full bg-primary hover:bg-primary/90 text-white border-primary px-4"
            onClick={onViewRestaurant}
          >
            Ver Restaurante
          </Button>
        </div>
        <p className="text-sm text-white/90 line-clamp-2">{video.description}</p>
      </div>
    </div>
  );
};

export default VideoCard;
