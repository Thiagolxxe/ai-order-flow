
import React, { useEffect } from 'react';
import VideoFeedContainer from '@/components/video-feed/VideoFeedContainer';
import VideoControls from '@/components/video-feed/VideoControls';
import { useVideoFeed } from '@/hooks/useVideoFeed';
import { Skeleton } from '@/components/ui/skeleton';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

// Type definition for Navigator with NetworkInformation
interface ExtendedNavigator extends Navigator {
  connection?: {
    effectiveType?: string;
    addEventListener?: (type: string, listener: EventListener) => void;
    removeEventListener?: (type: string, listener: EventListener) => void;
  };
}

const VideoFeed = () => {
  const {
    activeVideoIndex,
    muted,
    errorState,
    activeVideo,
    feedContainerRef,
    likedVideos,
    handleScroll,
    handleNext,
    handlePrevious,
    toggleMute,
    handleViewRestaurant,
    handleLike,
    handleShare,
    handleComment,
    videos,
    isLoading
  } = useVideoFeed();
  
  // Set proper metadata for OpenGraph when sharing
  useEffect(() => {
    if (activeVideo) {
      // Update document title when active video changes
      document.title = `${activeVideo.dishName} - ${activeVideo.restaurantName} | DeliveryAI`;
    }
  }, [activeVideo]);
  
  // Show adaptive streaming notice
  useEffect(() => {
    // Safely access the connection property from navigator with type assertion
    const extendedNavigator = navigator as ExtendedNavigator;
    const connection = extendedNavigator.connection;
    
    if (connection && (connection.effectiveType === '2g' || connection.effectiveType === '3g')) {
      setTimeout(() => {
        toast.info("Qualidade de vídeo ajustada para sua conexão atual", {
          duration: 3000,
        });
      }, 2000);
    }
  }, []);
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="space-y-4 w-full max-w-sm px-4">
          <Skeleton className="h-[70vh] w-full bg-gray-800 rounded-lg" />
          <div className="flex justify-between">
            <Skeleton className="h-10 w-24 bg-gray-800" />
            <Skeleton className="h-10 w-24 bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }
  
  if (errorState) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center p-4">
          <h2 className="text-xl font-bold mb-2">Erro ao carregar vídeos</h2>
          <p>{errorState}</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        {activeVideo && (
          <>
            <title>{`${activeVideo.dishName} - ${activeVideo.restaurantName}`}</title>
            <meta property="og:title" content={activeVideo.dishName} />
            <meta property="og:description" content={activeVideo.description} />
            <meta property="og:image" content={activeVideo.thumbnailUrl} />
            <meta property="og:type" content="video" />
            <meta property="og:video" content={activeVideo.videoUrl} />
            <meta name="twitter:card" content="player" />
            <meta name="twitter:title" content={activeVideo.dishName} />
            <meta name="twitter:description" content={activeVideo.description} />
            <meta name="twitter:image" content={activeVideo.thumbnailUrl} />
          </>
        )}
      </Helmet>
      
      <div className="fixed inset-0 bg-black">
        <VideoFeedContainer
          videos={videos}
          activeVideoIndex={activeVideoIndex}
          muted={muted}
          likedVideos={likedVideos || []}
          onMuteToggle={toggleMute}
          onViewRestaurant={handleViewRestaurant}
          onLike={handleLike}
          onShare={handleShare}
          onComment={handleComment}
          containerRef={feedContainerRef}
          onScroll={handleScroll}
        />
        
        <VideoControls 
          video={activeVideo}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onMuteToggle={toggleMute}
          muted={muted}
        />
      </div>
    </>
  );
};

export default VideoFeed;
