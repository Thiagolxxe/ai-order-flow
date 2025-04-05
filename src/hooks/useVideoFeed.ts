
import { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Video, VideoFeedState } from './video-feed/types';
import { MOCK_VIDEOS } from './video-feed/mock-data';
import { useVideoNavigation } from './video-feed/useVideoNavigation';
import { useVideoInteractions } from './video-feed/useVideoInteractions';
import { useChatInteraction } from './video-feed/useChatInteraction';
import { connectToDatabase } from '@/integrations/mongodb/client';

export type { Video } from './video-feed/types';

export const useVideoFeed = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Fetch videos from database
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const { db } = await connectToDatabase();
        const results = await db.collection('videos').find({ ativo: true });
        
        if (results.data && results.data.length > 0) {
          // Map database video format to app video format
          const mappedVideos: Video[] = results.data.map(video => ({
            id: video._id,
            restaurantId: video.restaurante_id,
            restaurantName: video.restaurante_nome || "Restaurante",
            dishName: video.titulo,
            price: video.preco || 0,
            videoUrl: video.video_url,
            thumbnailUrl: video.thumbnail_url || "",
            likes: video.likes || 0,
            description: video.descricao || "",
          }));
          
          setVideos(mappedVideos);
        } else {
          // Fallback to mock data if no videos found
          console.log("No videos found in database, using mock data");
          setVideos(MOCK_VIDEOS);
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
        toast.error("Erro ao carregar vídeos, usando dados de exemplo");
        setVideos(MOCK_VIDEOS);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVideos();
  }, []);
  
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
