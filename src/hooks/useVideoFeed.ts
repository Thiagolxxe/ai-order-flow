
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

  // Fetch videos from API using React Query
  const { isLoading, error } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      try {
        console.log('Fetching videos from API...');
        const params = createPaginationParams(1, 20);
        const { data, error } = await apiService.videos.getAll(params);
        
        if (error) {
          console.error('API returned error:', error);
          throw new Error(error.message || 'Erro ao buscar vídeos');
        }
        
        return data;
      } catch (err) {
        console.error('Error in query function:', err);
        // Usar dados simulados com URLs comprovadamente funcionais
        const workingVideos = MOCK_VIDEOS.map(video => ({
          ...video,
          videoUrl: video.videoUrl.replace('large.mp4', 'medium.mp4') // Usar versões de menor qualidade para melhor compatibilidade
        }));
        setVideos(workingVideos);
        toast.info("Usando dados de demonstração", {
          description: "Não foi possível conectar ao servidor de vídeos"
        });
        return { items: [] };
      }
    },
    meta: {
      onSettled: (data: any, error: Error | null) => {
        if (error) {
          console.error("Error fetching videos:", error);
          // Usar dados simulados com URLs comprovadamente funcionais
          const workingVideos = MOCK_VIDEOS.map(video => ({
            ...video,
            videoUrl: video.videoUrl.replace('large.mp4', 'medium.mp4') // Usar versões de menor qualidade para melhor compatibilidade
          }));
          setVideos(workingVideos);
          return;
        }
        
        if (data && data.items && data.items.length > 0) {
          // Map API video format to app video format
          const mappedVideos: Video[] = data.items.map((video: any) => ({
            id: video.id,
            restaurantId: video.restaurantId,
            restaurantName: video.restaurantName || "Restaurante",
            dishName: video.title,
            price: video.price || 0,
            videoUrl: video.url,
            thumbnailUrl: video.thumbnailUrl || "",
            likes: video.likes || 0,
            description: video.description || "",
          }));
          
          setVideos(mappedVideos);
        } else {
          // Usar dados simulados com URLs comprovadamente funcionais
          console.log("No videos found, using mock data");
          const workingVideos = MOCK_VIDEOS.map(video => ({
            ...video,
            videoUrl: video.videoUrl.replace('large.mp4', 'medium.mp4') // Usar versões de menor qualidade para melhor compatibilidade
          }));
          setVideos(workingVideos);
        }
      }
    },
    retry: 1, // Only retry once to avoid too many failed requests
    retryDelay: 1000 // Wait 1 second before retrying
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
  
  // Report watch progress for analytics com tratamento de erros aprimorado
  useEffect(() => {
    if (activeVideo) {
      const reportInterval = setInterval(() => {
        // Report every 5 seconds of watching
        apiService.videos.reportWatchProgress(
          activeVideo.id, 
          Math.random(), // Simulate watch progress percentage
          Date.now()
        ).catch(err => {
          // Silenciar erros de progresso para não afetar a experiência do usuário
          console.debug("Info: Erro reportando watch progress (esperado em ambiente de teste):", err);
        });
      }, 5000);
      
      return () => clearInterval(reportInterval);
    }
  }, [activeVideo]);
  
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
