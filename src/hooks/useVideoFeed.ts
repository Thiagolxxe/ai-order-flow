
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

// Lista de vídeos locais para demonstração
const LOCAL_DEMO_VIDEOS = [
  '/videos/food1.mp4',
  '/videos/food2.mp4',
  '/videos/food3.mp4',
  '/videos/food4.mp4',
  '/videos/food5.mp4',
];

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

  // Retorna vídeos de demonstração quando necessário
  const getLocalDemoVideos = useCallback((): Video[] => {
    return MOCK_VIDEOS.map((video, index) => ({
      ...video,
      videoUrl: LOCAL_DEMO_VIDEOS[index % LOCAL_DEMO_VIDEOS.length],
    }));
  }, []);

  // Fetch videos from API using React Query
  const { isLoading, error } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      try {
        console.log('Fetching videos from API...');
        const params = createPaginationParams(1, 20);
        const { data, error, success } = await apiService.videos.getAll(params);
        
        if (error) {
          console.error('API returned error:', error);
          throw new Error(error.message || 'Erro ao buscar vídeos');
        }
        
        return data;
      } catch (err: any) {
        console.error('Error in query function:', err);
        // Mostrar um toast mais informativo sobre o problema
        toast.error("Erro de conexão com o servidor", {
          description: "Usando vídeos de demonstração enquanto tentamos reconectar",
          duration: 4000,
        });
        
        // Usar vídeos locais em vez de fazer requisições que falharão
        console.log("Usando vídeos locais devido à falha no servidor");
        const localVideos = getLocalDemoVideos();
        setVideos(localVideos);
        return { items: [] };
      }
    },
    meta: {
      onSettled: (data: any, error: Error | null) => {
        if (error) {
          console.error("Error fetching videos:", error);
          // Usar dados simulados com links para vídeos locais
          const localVideos = getLocalDemoVideos();
          setVideos(localVideos);
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
          // Usar dados simulados com URLs locais
          console.log("No videos found, using mock data with local videos");
          const localVideos = getLocalDemoVideos();
          setVideos(localVideos);
        }
      }
    },
    retry: 1, // Tentar apenas uma vez para evitar muitas requisições
    retryDelay: 1000, // Aguardar 1 segundo antes de tentar novamente
    staleTime: 1000 * 60 * 5, // 5 minutos - dados permanecem frescos por mais tempo
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
    if (!activeVideo) return;
    
    let reportCount = 0;
    const maxReportAttempts = 3;
    let reportInterval: number | null = null;
    
    // Função para reportar progresso
    const reportProgress = async () => {
      try {
        // Limitar o número de tentativas em caso de falha constante
        if (reportCount >= maxReportAttempts) {
          console.log("Cancelando reportagem de progresso após múltiplas falhas");
          if (reportInterval) {
            clearInterval(reportInterval);
            reportInterval = null;
          }
          return;
        }
        
        // Report watch progress
        const result = await apiService.videos.reportWatchProgress(
          activeVideo.id, 
          Math.random(), // Simulate watch progress percentage
          Date.now()
        );
        
        // Se houver erro, incrementar contagem de falhas
        if (!result.success) {
          reportCount++;
          console.debug("Info: Erro reportando watch progress (esperado em ambiente de teste):", result.error);
          
          if (reportCount >= maxReportAttempts) {
            console.log("Limite de tentativas de reportagem atingido. Desativando monitoramento.");
            if (reportInterval) {
              clearInterval(reportInterval);
              reportInterval = null;
            }
          }
        }
      } catch (err) {
        reportCount++;
        console.debug("Erro não tratado reportando watch progress:", err);
        
        if (reportCount >= maxReportAttempts) {
          console.log("Limite de tentativas de reportagem atingido após erro não tratado. Desativando monitoramento.");
          if (reportInterval) {
            clearInterval(reportInterval);
            reportInterval = null;
          }
        }
      }
    };
    
    // Iniciar intervalo
    reportInterval = window.setInterval(reportProgress, 5000);
    
    // Cleanup function
    return () => {
      if (reportInterval) {
        clearInterval(reportInterval);
        reportInterval = null;
      }
    };
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
