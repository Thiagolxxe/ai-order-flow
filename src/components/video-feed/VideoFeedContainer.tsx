
import React from 'react';
import { Video } from '@/hooks/useVideoFeed';
import VideoCard from '@/components/video-feed/VideoCard';

interface VideoFeedContainerProps {
  videos: Video[];
  activeVideoIndex: number;
  muted: boolean;
  onMuteToggle: () => void;
  onViewRestaurant: (restaurantId: string) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  onScroll: () => void;
}

const VideoFeedContainer = ({
  videos,
  activeVideoIndex,
  muted,
  onMuteToggle,
  onViewRestaurant,
  containerRef,
  onScroll
}: VideoFeedContainerProps) => {
  return (
    <div 
      ref={containerRef}
      className="h-full w-full overflow-y-scroll snap-y snap-mandatory"
      onScroll={onScroll}
    >
      {videos.map((video, index) => (
        <div key={video.id} className="h-full w-full snap-start snap-always">
          <VideoCard
            video={video}
            isActive={index === activeVideoIndex}
            muted={muted}
            onMuteToggle={onMuteToggle}
            onViewRestaurant={() => onViewRestaurant(video.restaurantId)}
          />
        </div>
      ))}
    </div>
  );
};

export default VideoFeedContainer;
