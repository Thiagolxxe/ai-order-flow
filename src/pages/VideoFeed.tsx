
import React from 'react';
import VideoFeedContainer from '@/components/video-feed/VideoFeedContainer';
import VideoControls from '@/components/video-feed/VideoControls';
import ChatButton from '@/components/video-feed/ChatButton';
import { useVideoFeed } from '@/hooks/useVideoFeed';

const VideoFeed = () => {
  const {
    activeVideoIndex,
    muted,
    errorState,
    activeVideo,
    feedContainerRef,
    handleScroll,
    openChat,
    handleNext,
    handlePrevious,
    toggleMute,
    handleViewRestaurant,
    videos
  } = useVideoFeed();
  
  return (
    <div className="fixed inset-0 bg-black">
      <VideoFeedContainer
        videos={videos}
        activeVideoIndex={activeVideoIndex}
        muted={muted}
        onMuteToggle={toggleMute}
        onViewRestaurant={handleViewRestaurant}
        containerRef={feedContainerRef}
        onScroll={handleScroll}
      />
      
      <ChatButton
        onClick={() => openChat(activeVideo.dishName, activeVideo.restaurantName)}
        disabled={!!errorState}
        errorState={errorState}
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
