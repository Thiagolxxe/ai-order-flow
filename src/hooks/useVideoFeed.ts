
import { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, VideoFeedState } from './video-feed/types';
import { MOCK_VIDEOS } from './video-feed/mock-data';
import { useVideoNavigation } from './video-feed/useVideoNavigation';
import { useVideoInteractions } from './video-feed/useVideoInteractions';
import { useChatInteraction } from './video-feed/useChatInteraction';

export type { Video } from './video-feed/types';

export const useVideoFeed = () => {
  const navigate = useNavigate();
  const [videos] = useState<Video[]>(MOCK_VIDEOS);
  const feedContainerRef = useRef<HTMLDivElement>(null);
  
  // Video state management
  const [state, setState] = useState<VideoFeedState>({
    activeVideoIndex: 0,
    muted: true,
    errorState: null,
    likedVideos: [],
  });
  
  const { activeVideoIndex, muted, errorState, likedVideos } = state;
  
  // Active video
  const activeVideo = videos[activeVideoIndex] || videos[0];
  
  // State updaters
  const setActiveVideoIndex = useCallback((index: number) => {
    setState(prev => ({ ...prev, activeVideoIndex: index }));
  }, []);
  
  const setLikedVideos = useCallback((updateFn: (prev: string[]) => string[]) => {
    setState(prev => ({
      ...prev,
      likedVideos: updateFn(prev.likedVideos || []),
    }));
  }, []);
  
  const setErrorState = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, errorState: error }));
  }, []);
  
  // Toggle mute
  const toggleMute = useCallback(() => {
    setState(prev => ({ ...prev, muted: !prev.muted }));
  }, []);
  
  // Navigation hooks
  const { handleScroll, handleNext, handlePrevious } = useVideoNavigation(
    activeVideoIndex,
    setActiveVideoIndex,
    videos.length,
    feedContainerRef
  );
  
  // Interaction hooks
  const { handleViewRestaurant, handleLike, handleShare, handleComment } = 
    useVideoInteractions(setLikedVideos);
  
  // Chat interaction
  const { openChat } = useChatInteraction(setErrorState);
  
  // Handle comment with AI chat
  const handleCommentWithAI = useCallback((video: Video) => {
    openChat(video.dishName, video.restaurantName);
  }, [openChat]);
  
  return {
    activeVideoIndex,
    muted,
    errorState,
    likedVideos,
    activeVideo,
    feedContainerRef,
    videos,
    handleScroll,
    handleNext,
    handlePrevious,
    toggleMute,
    handleViewRestaurant,
    handleLike,
    handleShare,
    handleComment: handleCommentWithAI,
  };
};
