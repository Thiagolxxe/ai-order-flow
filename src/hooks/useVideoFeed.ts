
import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGeminiAI } from '@/hooks/useGeminiAI';
import { toast } from 'sonner';

// Mock video data with reliable sources 
export const MOCK_VIDEOS = [
  {
    id: '1',
    restaurantId: '00000000-0000-0000-0000-000000000r01',
    restaurantName: 'Pizzaria Bella Napoli',
    dishName: 'Pizza Margherita',
    price: 49.90,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-homemade-margherita-pizza-on-a-table-40799-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    likes: 1243,
    description: 'Nossa deliciosa pizza margherita tradicional, com molho de tomate caseiro, muçarela de búfala e manjericão fresco.',
  },
  {
    id: '2',
    restaurantId: '00000000-0000-0000-0000-000000000r02',
    restaurantName: 'Sabor Oriental',
    dishName: 'Combinado Especial',
    price: 89.90,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-serving-sushi-at-a-japanese-restaurant-9181-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    likes: 856,
    description: 'Combinado especial com 16 peças variadas de sushi e sashimi, ideal para compartilhar.',
  },
  {
    id: '3',
    restaurantId: '00000000-0000-0000-0000-000000000r03',
    restaurantName: 'Hamburgeria Ground Zero',
    dishName: 'Burger Duplo',
    price: 39.90,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-preparing-a-hamburger-on-a-grill-35593-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    likes: 2405,
    description: 'Hambúrguer duplo com cheddar derretido, bacon crocante e molho especial da casa.',
  },
  {
    id: '4',
    restaurantId: '00000000-0000-0000-0000-000000000r04',
    restaurantName: 'Cantina Toscana',
    dishName: 'Fettuccine Alfredo',
    price: 54.90,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pasta-being-prepared-with-cheese-19151-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    likes: 1876,
    description: 'Massa fresca artesanal com molho cremoso de queijo parmesão e manteiga.',
  },
  {
    id: '5',
    restaurantId: '00000000-0000-0000-0000-000000000r05',
    restaurantName: 'Doceria Sweet Dreams',
    dishName: 'Bolo de Chocolate Trufado',
    price: 18.90,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cutting-a-chocolate-cake-on-a-plate-43132-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    likes: 3201,
    description: 'Fatia generosa do nosso bolo de chocolate premium, com recheio de trufa e cobertura de ganache.',
  }
];

export interface Video {
  id: string;
  restaurantId: string;
  restaurantName: string;
  dishName: string;
  price: number;
  videoUrl: string;
  thumbnailUrl: string;
  likes: number;
  description: string;
}

export const useVideoFeed = () => {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [likedVideos, setLikedVideos] = useState<string[]>([]);
  const navigate = useNavigate();
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const { sendMessage } = useGeminiAI();
  
  const activeVideo = MOCK_VIDEOS[activeVideoIndex];
  
  const handleScroll = useCallback(() => {
    if (!feedContainerRef.current) return;
    
    const container = feedContainerRef.current;
    const scrollPosition = container.scrollTop;
    const videoHeight = container.clientHeight;
    const videoIndex = Math.round(scrollPosition / videoHeight);
    
    if (videoIndex !== activeVideoIndex && videoIndex < MOCK_VIDEOS.length) {
      setActiveVideoIndex(videoIndex);
    }
  }, [activeVideoIndex]);
  
  const openChat = useCallback((dishName: string, restaurantName: string) => {
    try {
      // Prepare a welcome message about the specific dish
      const initialPrompt = `Olá! Você está interessado no ${dishName} do restaurante ${restaurantName}? Posso ajudar com este pedido ou sugerir outras opções.`;
      
      // Send the message to Gemini
      sendMessage(initialPrompt)
        .then(() => {
          // Open the chat assistant modal
          document.dispatchEvent(new CustomEvent('openGeminiChat'));
          
          // Show a toast confirming the action
          toast.success(`Iniciando conversa sobre ${dishName}`);
        })
        .catch((error) => {
          console.error('Error opening chat:', error);
          toast.error('Não foi possível iniciar o chat agora. Tente novamente mais tarde.');
          setErrorState('Erro ao iniciar chat');
        });
      
      // Log for debugging
      console.log(`Opening chat for ${dishName} from ${restaurantName}`);
    } catch (error) {
      console.error('Error in openChat function:', error);
      toast.error('Ocorreu um erro ao abrir o chat. Tente novamente.');
      setErrorState('Erro ao iniciar chat');
    }
  }, [sendMessage]);

  const handleNext = useCallback(() => {
    if (activeVideoIndex < MOCK_VIDEOS.length - 1) {
      setActiveVideoIndex(prev => prev + 1);
      if (feedContainerRef.current) {
        feedContainerRef.current.scrollTo({
          top: feedContainerRef.current.clientHeight * (activeVideoIndex + 1),
          behavior: 'smooth'
        });
      }
    }
  }, [activeVideoIndex]);

  const handlePrevious = useCallback(() => {
    if (activeVideoIndex > 0) {
      setActiveVideoIndex(prev => prev - 1);
      if (feedContainerRef.current) {
        feedContainerRef.current.scrollTo({
          top: feedContainerRef.current.clientHeight * (activeVideoIndex - 1),
          behavior: 'smooth'
        });
      }
    }
  }, [activeVideoIndex]);

  const toggleMute = useCallback(() => {
    setMuted(prev => !prev);
  }, []);

  const handleViewRestaurant = useCallback((restaurantId: string) => {
    navigate(`/restaurante/${restaurantId}`);
  }, [navigate]);

  // New handlers for side buttons
  const handleLike = useCallback((videoId: string) => {
    setLikedVideos(prev => {
      if (prev.includes(videoId)) {
        // Unlike the video
        toast.success("Curtida removida");
        return prev.filter(id => id !== videoId);
      } else {
        // Like the video
        toast.success("Vídeo curtido!");
        return [...prev, videoId];
      }
    });
  }, []);

  const handleShare = useCallback((video: Video) => {
    // In a real app, this would open a share dialog
    toast.success(`Compartilhando ${video.dishName} do ${video.restaurantName}`);
    
    // Mock share functionality
    if (navigator.share) {
      navigator.share({
        title: `${video.dishName} - ${video.restaurantName}`,
        text: video.description,
        url: window.location.href,
      })
      .catch((error) => {
        console.error('Error sharing:', error);
        toast.error('Não foi possível compartilhar este vídeo');
      });
    } else {
      // Fallback for browsers that don't support navigator.share
      toast.info('Compartilhamento disponível em breve!');
    }
  }, []);

  const handleComment = useCallback((video: Video) => {
    toast.info(`Comentários para ${video.dishName} estarão disponíveis em breve!`);
  }, []);

  // Clear error state after 5 seconds
  useEffect(() => {
    if (errorState) {
      const timer = setTimeout(() => {
        setErrorState(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [errorState]);
  
  return {
    activeVideoIndex,
    muted,
    errorState,
    activeVideo,
    feedContainerRef,
    likedVideos,
    handleScroll,
    openChat,
    handleNext,
    handlePrevious,
    toggleMute,
    handleViewRestaurant,
    handleLike,
    handleShare,
    handleComment,
    videos: MOCK_VIDEOS
  };
};
