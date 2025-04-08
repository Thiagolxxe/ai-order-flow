
import { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Video, VideoFeedState } from './video-feed/types';
import { MOCK_VIDEOS } from './video-feed/mock-data';
import { useVideoNavigation } from './video-feed/useVideoNavigation';
import { useVideoInteractions } from './video-feed/useVideoInteractions';
import { useChatInteraction } from './video-feed/useChatInteraction';
import { apiService } from '@/services/apiService';
import { createPaginationParams } from '@/utils/paginationUtils';
import { useQuery } from '@tanstack/react-query';

export type { Video } from './video-feed/types';

export const useVideoFeed = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
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
  const activeVideo = videos[activeVideoIndex] || null;

  // Fetch videos from API
  const { isLoading, error } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const params = createPaginationParams(1, 20);
      const { data, error } = await apiService.videos.getAll(params);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (data) => {
      if (data && data.length > 0) {
        // Map API video format to app video format
        const mappedVideos: Video[] = data.map(video => ({
          id: video.id || video._id,
          restaurantId: video.restaurantId || video.restaurante_id,
          restaurantName: video.restaurantName || video.restaurante_nome || "Restaurante",
          dishName: video.dishName || video.titulo,
          price: video.price || video.preco || 0,
          videoUrl: video.videoUrl || video.video_url,
          thumbnailUrl: video.thumbnailUrl || video.thumbnail_url || "",
          likes: video.likes || 0,
          description: video.description || video.descricao || "",
        }));
        
        setVideos(mappedVideos);
      } else {
        // Fallback to mock data if no videos found
        console.log("No videos found, using mock data");
        setVideos(MOCK_VIDEOS);
      }
    },
    onError: (err: Error) => {
      console.error("Error fetching videos:", err);
      toast.error("Erro ao carregar vídeos, usando dados de exemplo");
      setVideos(MOCK_VIDEOS);
    }
  });
  
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
    isLoading,
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
