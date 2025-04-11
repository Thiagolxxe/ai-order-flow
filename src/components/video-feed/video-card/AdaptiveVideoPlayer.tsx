
import React, { useEffect, useRef, useState } from 'react';
import { Play, Loader2 } from 'lucide-react';

interface AdaptiveVideoPlayerProps {
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
  isActive: boolean;
  muted: boolean;
  onClickVideo: () => void;
  onProgress?: (progress: number) => void;
}

const AdaptiveVideoPlayer: React.FC<AdaptiveVideoPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  title,
  isActive,
  muted,
  onClickVideo,
  onProgress
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuality, setCurrentQuality] = useState<string>('auto');
  const [networkQuality, setNetworkQuality] = useState<string>('high');
  
  // Check network conditions
  useEffect(() => {
    const connection = (navigator as any).connection;
    
    if (connection) {
      const updateNetworkQuality = () => {
        const { effectiveType, downlink } = connection;
        
        if (effectiveType === '4g' && downlink > 1.5) {
          setNetworkQuality('high');
        } else if (effectiveType === '4g' || effectiveType === '3g' && downlink > 0.5) {
          setNetworkQuality('medium');
        } else {
          setNetworkQuality('low');
        }
      };
      
      updateNetworkQuality();
      connection.addEventListener('change', updateNetworkQuality);
      
      return () => {
        connection.removeEventListener('change', updateNetworkQuality);
      };
    }
  }, []);
  
  // Handle video loading and playing
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleCanPlay = () => {
      setIsLoading(false);
      if (isActive) {
        video.play().catch(err => console.error('Error playing video:', err));
      }
    };
    
    const handleWaiting = () => {
      setIsLoading(true);
    };
    
    const handleTimeUpdate = () => {
      if (onProgress && video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        onProgress(progress);
      }
    };
    
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isActive, onProgress]);
  
  // Control playback based on active state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isActive) {
      video.play().catch(err => console.error('Error playing video:', err));
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive]);
  
  // Update muted state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);
  
  // Generate source URLs for different qualities
  const getSourceUrl = (quality: string): string => {
    // In a real implementation, this would return different URLs for different qualities
    // For now, we'll just use the same URL
    return videoUrl;
  };
  
  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {thumbnailUrl && (
        <img 
          src={thumbnailUrl} 
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: isLoading || !isActive ? 1 : 0 }}
        />
      )}
      
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-contain z-10"
        loop
        playsInline
        muted={muted}
        preload="metadata"
        poster={thumbnailUrl}
        onClick={onClickVideo}
      >
        {networkQuality === 'high' && <source src={getSourceUrl('high')} type="video/mp4" />}
        {networkQuality === 'medium' && <source src={getSourceUrl('medium')} type="video/mp4" />}
        {networkQuality === 'low' && <source src={getSourceUrl('low')} type="video/mp4" />}
        Seu navegador não suporta vídeos HTML5.
      </video>
      
      {isLoading && isActive && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <Loader2 className="h-12 w-12 text-white animate-spin" />
        </div>
      )}
      
      {!isActive && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 cursor-pointer"
          onClick={onClickVideo}
        >
          <div className="bg-white/20 rounded-full p-4">
            <Play className="h-12 w-12 text-white" />
          </div>
        </div>
      )}
      
      {isActive && networkQuality !== 'high' && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded z-30">
          {networkQuality === 'low' ? 'Qualidade reduzida' : 'Qualidade média'}
        </div>
      )}
    </div>
  );
};

export default AdaptiveVideoPlayer;
