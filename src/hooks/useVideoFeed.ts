import { useState, useEffect, useRef, useCallback } from 'react';
import { Video } from '@/hooks/video-feed/types';
import { videoService } from '@/services/api/videoService';
import { useQuery } from '@tanstack/react-query';
import { useVideoNavigation } from '@/hooks/video-feed/useVideoNavigation';
import { useVideoInteractions } from '@/hooks/video-feed/useVideoInteractions';
import { toast } from 'sonner';
import { MOCK_VIDEOS } from '@/hooks/video-feed/mock-data';

export const useVideoFeed = () => {
  const [errorState, setErrorState] = useState<string | null>(null);
  const [useMockDataFlag, setUseMockDataFlag] = useState<boolean>(false);
  
  // Consulta para buscar vídeos da API com fallback para dados mock
  const videosQuery = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      try {
        console.log('Fetching videos from API...');
        
        // Se a flag de mock estiver ativa, usar dados mock
        if (useMockDataFlag) {
          console.log('Using mock data instead of API call');
          return { videos: MOCK_VIDEOS };
        }
        
        const { data, error, success } = await videoService.getAll({
          page: 1,
          limit: 20
        });
        
        // Se houver erro na API, registrar e lançar erro
        if (error) {
          console.log('API returned error:', error);
          throw new Error(error.message || 'Erro ao buscar vídeos');
        }
        
        // Se não houver dados ou o array estiver vazio, usar dados mock
        if (!data?.items || data.items.length === 0) {
          console.log('No videos returned from API, using mock data');
          toast.info('Usando dados de demonstração', { duration: 3000 });
          setUseMockDataFlag(true);
          return { videos: MOCK_VIDEOS };
        }
        
        return { videos: data.items };
      } catch (error: any) {
        console.error('Error in query function:', error);
        
        // Definir mensagem de erro para exibição
        setErrorState(error.message || 'Falha ao carregar vídeos');
        
        // Ativar fallback para dados mock automaticamente
        console.log('Error fetching videos, using mock data');
        toast.error('Erro ao buscar vídeos do servidor', { duration: 3000 });
        toast.info('Usando dados de demonstração', { duration: 3000 });
        setUseMockDataFlag(true);
        
        return { videos: MOCK_VIDEOS };
      }
    },
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });
  
  const videos = videosQuery.data?.videos || [];
  const isLoading = videosQuery.isLoading;
  
  // Referência ao contêiner de feed para manipulação de scroll
  const feedContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Gerenciamento de navegação (próximo, anterior, índice ativo)
  const {
    activeVideoIndex,
    handleNext,
    handlePrevious,
    setActiveVideoIndex
  } = useVideoNavigation(videos);
  
  // Gerenciamento de interações (curtir, compartilhar, comentar)
  const {
    muted,
    likedVideos,
    toggleMute,
    handleLike,
    handleShare,
    handleComment,
    handleViewRestaurant,
  } = useVideoInteractions();
  
  // Vídeo ativo atual
  const activeVideo = videos[activeVideoIndex];
  
  // Manipulador de scroll para navegação baseada em swipe
  const handleScroll = useCallback((direction: 'up' | 'down') => {
    if (direction === 'up') {
      handleNext();
    } else {
      handlePrevious();
    }
  }, [handleNext, handlePrevious]);
  
  // Limpar estado de erro
  const resetErrorState = useCallback(() => {
    setErrorState(null);
  }, []);
  
  // Forçar uso de dados mock
  const useMockData = useCallback(() => {
    setUseMockDataFlag(true);
    videosQuery.refetch();
  }, [videosQuery]);
  
  // Efeito para reportar progresso de visualização
  useEffect(() => {
    if (!activeVideo) return;
    
    // Intervalo para reportar progresso de visualização a cada 10 segundos
    const reportingInterval = setInterval(() => {
      try {
        // Se estiver usando dados mock, não reportar progresso
        if (useMockDataFlag) return;
        
        videoService.reportWatchProgress(activeVideo.id, {
          progress: 0.5, // Valor de exemplo, idealmente seria calculado com base no tempo atual de reprodução
          timestamp: Date.now()
        }).catch(err => {
          // Não exibir erro ao usuário se falhar, apenas registrar no console
          console.debug('Failed to report watch progress:', err);
        });
      } catch (error) {
        console.debug('Error in watch progress reporting:', error);
      }
    }, 10000);
    
    return () => clearInterval(reportingInterval);
  }, [activeVideo, useMockDataFlag]);
  
  // Pré-carregar próximo vídeo para melhorar a experiência do usuário
  useEffect(() => {
    if (videos.length <= 1 || activeVideoIndex >= videos.length - 1) return;
    
    const nextVideo = videos[activeVideoIndex + 1];
    if (!nextVideo) return;
    
    try {
      // Pré-carregar próximo vídeo
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'video';
      preloadLink.href = nextVideo.videoUrl;
      document.head.appendChild(preloadLink);
      
      // Pré-carregar thumbnail
      if (nextVideo.thumbnailUrl) {
        const preloadImage = document.createElement('link');
        preloadImage.rel = 'preload';
        preloadImage.as = 'image';
        preloadImage.href = nextVideo.thumbnailUrl;
        document.head.appendChild(preloadImage);
      }
      
      return () => {
        document.head.removeChild(preloadLink);
        if (nextVideo.thumbnailUrl) {
          document.head.removeChild(preloadLink);
        }
      };
    } catch (error) {
      console.debug('Error preloading next video:', error);
    }
  }, [activeVideoIndex, videos]);
  
  return {
    videos,
    activeVideoIndex,
    muted,
    likedVideos,
    activeVideo,
    feedContainerRef,
    errorState,
    isLoading,
    handleScroll,
    handleNext,
    handlePrevious,
    toggleMute,
    handleLike,
    handleShare,
    handleComment,
    handleViewRestaurant,
    resetErrorState,
    useMockData
  };
};
