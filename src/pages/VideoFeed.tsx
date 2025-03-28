
import React from 'react';
import VideoFeedContainer from '@/components/video-feed/VideoFeedContainer';
import VideoControls from '@/components/video-feed/VideoControls';
import { useVideoFeed } from '@/hooks/useVideoFeed';

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
    videos
  } = useVideoFeed();
  
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
