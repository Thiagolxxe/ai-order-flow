
import React, { useRef, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl: string;
  dishName: string;
  isActive: boolean;
  muted: boolean;
  onClickVideo: () => void;
}

const VideoPlayer = ({ 
  videoUrl, 
  thumbnailUrl, 
  dishName, 
  isActive, 
  muted,
  onClickVideo
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Generate a background image based on the dish name
  const backgroundImage = `https://source.unsplash.com/random/800x600/?${dishName.split(' ')[0].toLowerCase()},food`;

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
    console.error("Video failed to load:", videoUrl);
  };

  return (
    <>
      {/* Background image for all states */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm"
        style={{ backgroundImage: `url(${thumbnailUrl || backgroundImage})` }}
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
              {dishName}
            </p>
          </div>
        </div>
      )}
      
      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="absolute inset-0 object-cover w-full h-full"
        playsInline
        loop
        muted={muted}
        onClick={onClickVideo}
        onLoadedData={handleVideoLoaded}
        onError={handleVideoError}
        poster={thumbnailUrl || backgroundImage}
      />
      
      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
    </>
  );
};

export default VideoPlayer;
