
import React from 'react';
import { Video } from '@/hooks/video-feed/types';
import VideoCard from '@/components/video-feed/video-card';

interface VideoFeedContainerProps {
  videos: Video[];
  activeVideoIndex: number;
  muted: boolean;
  likedVideos: string[];
  onMuteToggle: () => void;
  onViewRestaurant: (restaurantId: string) => void;
  onLike: (videoId: string) => void;
  onShare: (video: Video) => void;
  onComment: (video: Video) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  onScroll: () => void;
}

const VideoFeedContainer = ({
  videos,
  activeVideoIndex,
  muted,
  likedVideos,
  onMuteToggle,
  onViewRestaurant,
  onLike,
  onShare,
  onComment,
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
            isLiked={likedVideos && likedVideos.includes(video.id)}
            onMuteToggle={onMuteToggle}
            onViewRestaurant={() => onViewRestaurant(video.restaurantId)}
            onLike={() => onLike(video.id)}
            onShare={() => onShare(video)}
            onComment={() => onComment(video)}
          />
        </div>
      ))}
    </div>
  );
};

export default VideoFeedContainer;
