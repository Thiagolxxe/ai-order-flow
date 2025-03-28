
import React, { useRef, useEffect, useState } from 'react';
import { Heart, Share2, Info, Volume2, VolumeX, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Video {
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

interface VideoCardProps {
  video: Video;
  isActive: boolean;
  muted: boolean;
  onMuteToggle: () => void;
  onViewRestaurant: () => void;
  onLike: () => void;
  onShare: () => void;
  onComment: () => void;
  isLiked: boolean;
}

const VideoCard = ({ 
  video, 
  isActive, 
  muted, 
  onMuteToggle, 
  onViewRestaurant,
  onLike,
  onShare,
  onComment,
  isLiked
}: VideoCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Handle video playback based on active state
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isActive) {
      try {
        videoRef.current.currentTime = 0;
        const playPromise = videoRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsLoading(false);
              setError(null);
            })
            .catch(err => {
              console.error("Error playing video:", err);
              setError("Não foi possível reproduzir o vídeo");
            });
        }
      } catch (err) {
        console.error("Error in video playback:", err);
        setError("Erro ao carregar o vídeo");
      }
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

  // Handle video events
  const handleVideoLoaded = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setError("Erro ao carregar o vídeo");
    console.error("Video failed to load:", video.videoUrl);
  };

  // Generate a background image based on the dish name
  const backgroundImage = `https://source.unsplash.com/random/800x600/?${video.dishName.split(' ')[0].toLowerCase()},food`;

  return (
    <div className="relative h-full w-full bg-black">
      {/* Background image for all states */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm"
        style={{ backgroundImage: `url(${video.thumbnailUrl || backgroundImage})` }}
      />
      
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
          <div className="flex flex-col items-center">
            <Skeleton className="h-40 w-40 rounded-lg bg-gray-700" />
            <p className="text-white/80 mt-4">Carregando vídeo...</p>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
          <div className="flex flex-col items-center text-center p-4">
            <p className="text-white font-semibold text-lg">{error}</p>
            <p className="text-white/70 mt-2">
              {video.dishName} - {video.restaurantName}
            </p>
          </div>
        </div>
      )}
      
      {/* Video */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="absolute inset-0 object-cover w-full h-full"
        playsInline
        loop
        muted={muted}
        onClick={onMuteToggle}
        onLoadedData={handleVideoLoaded}
        onError={handleVideoError}
        poster={video.thumbnailUrl || backgroundImage}
      />
      
      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
      
      {/* Top info */}
      <div className="absolute top-0 inset-x-0 p-4 text-white z-20">
        <h2 className="font-semibold text-xl drop-shadow-lg">{video.dishName}</h2>
        <p className="text-white/90 text-sm drop-shadow-md">{video.restaurantName}</p>
      </div>
      
      {/* Side icons - moved to the right with proper spacing */}
      <div className="absolute right-4 top-1/3 flex flex-col items-center space-y-8 z-20">
        <div className="flex flex-col items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onLike}
            className="rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white w-12 h-12 hover:scale-110 transition-all"
          >
            <Heart 
              size={26} 
              className={isLiked ? "fill-primary text-primary" : "text-white hover:text-primary transition-colors"} 
            />
          </Button>
          <span className="text-white text-xs mt-1 font-medium">{video.likes}</span>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onComment}
          className="rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white w-12 h-12 hover:scale-110 transition-all"
        >
          <MessageCircle size={26} />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onShare}
          className="rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white w-12 h-12 hover:scale-110 transition-all"
        >
          <Share2 size={26} />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onViewRestaurant}
          className="rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white w-12 h-12 hover:scale-110 transition-all"
        >
          <Info size={26} />
        </Button>
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
      
      {/* Volume button at the bottom right */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-4 right-4 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white w-12 h-12 hover:scale-110 transition-all z-20"
        onClick={onMuteToggle}
      >
        {muted ? <VolumeX size={26} /> : <Volume2 size={26} />}
        <span className="sr-only">{muted ? 'Ativar som' : 'Desativar som'}</span>
      </Button>
    </div>
  );
};

export default VideoCard;
