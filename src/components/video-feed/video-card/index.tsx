
import React from 'react';
import { Video } from '@/hooks/useVideoFeed';
import VideoPlayer from './VideoPlayer';
import VideoInfo from './VideoInfo';
import ActionButtons from './ActionButtons';
import VideoControlsButton from './VideoControls';

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
  return (
    <div className="relative h-full w-full bg-black">
      <VideoPlayer 
        videoUrl={video.videoUrl}
        thumbnailUrl={video.thumbnailUrl}
        dishName={video.dishName}
        isActive={isActive}
        muted={muted}
        onClickVideo={onMuteToggle}
      />
      
      <VideoInfo 
        video={video}
        onViewRestaurant={onViewRestaurant}
      />
      
      <ActionButtons 
        video={video}
        isLiked={isLiked}
        onLike={onLike}
        onShare={onShare}
        onComment={onComment}
        onViewRestaurant={onViewRestaurant}
      />
      
      <VideoControlsButton 
        muted={muted}
        onMuteToggle={onMuteToggle}
      />
    </div>
  );
};

export default VideoCard;
