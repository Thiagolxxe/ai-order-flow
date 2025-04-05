
import React from 'react';
import VideoFeedContainer from '@/components/video-feed/VideoFeedContainer';
import VideoControls from '@/components/video-feed/VideoControls';
import { useVideoFeed } from '@/hooks/useVideoFeed';
import { Skeleton } from '@/components/ui/skeleton';

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
  );
};

export default VideoFeed;
