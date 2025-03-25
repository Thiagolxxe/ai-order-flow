
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoCard from '@/components/video-feed/VideoCard';
import VideoControls from '@/components/video-feed/VideoControls';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useGeminiAI } from '@/hooks/useGeminiAI';
import { toast } from 'sonner';

// Mock video data - in a real app, this would come from an API
const MOCK_VIDEOS = [
  {
    id: '1',
    restaurantId: '00000000-0000-0000-0000-000000000r01',
    restaurantName: 'Pizzaria Bella Napoli',
    dishName: 'Pizza Margherita',
    price: 49.90,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-person-eating-pizza-with-a-fork-and-43122-large.mp4',
    likes: 1243,
    description: 'Nossa deliciosa pizza margherita tradicional, com molho de tomate caseiro, muçarela de búfala e manjericão fresco.',
  },
  {
    id: '2',
    restaurantId: '00000000-0000-0000-0000-000000000r02',
    restaurantName: 'Sabor Oriental',
    dishName: 'Combinado Especial',
    price: 89.90,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-and-eating-a-slice-of-sushi-34551-large.mp4',
    likes: 856,
    description: 'Combinado especial com 16 peças variadas de sushi e sashimi, ideal para compartilhar.',
  },
  {
    id: '3',
    restaurantId: '00000000-0000-0000-0000-000000000r03',
    restaurantName: 'Hamburgeria Ground Zero',
    dishName: 'Burger Duplo',
    price: 39.90,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cooking-a-burger-on-a-barbecue-grill-24051-large.mp4',
    likes: 2405,
    description: 'Hambúrguer duplo com cheddar derretido, bacon crocante e molho especial da casa.',
  },
];

const VideoFeed = () => {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const navigate = useNavigate();
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const { sendMessage } = useGeminiAI();
  
  const activeVideo = MOCK_VIDEOS[activeVideoIndex];
  
  const handleScroll = () => {
    if (!feedContainerRef.current) return;
    
    const container = feedContainerRef.current;
    const scrollPosition = container.scrollTop;
    const videoHeight = container.clientHeight;
    const videoIndex = Math.round(scrollPosition / videoHeight);
    
    if (videoIndex !== activeVideoIndex && videoIndex < MOCK_VIDEOS.length) {
      setActiveVideoIndex(videoIndex);
    }
  };
  
  const openChat = (dishName: string, restaurantName: string) => {
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
  };

  const handleNext = () => {
    if (activeVideoIndex < MOCK_VIDEOS.length - 1) {
      setActiveVideoIndex(prev => prev + 1);
      if (feedContainerRef.current) {
        feedContainerRef.current.scrollTo({
          top: feedContainerRef.current.clientHeight * (activeVideoIndex + 1),
          behavior: 'smooth'
        });
      }
    }
  };

  const handlePrevious = () => {
    if (activeVideoIndex > 0) {
      setActiveVideoIndex(prev => prev - 1);
      if (feedContainerRef.current) {
        feedContainerRef.current.scrollTo({
          top: feedContainerRef.current.clientHeight * (activeVideoIndex - 1),
          behavior: 'smooth'
        });
      }
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const handleViewRestaurant = (restaurantId: string) => {
    navigate(`/restaurante/${restaurantId}`);
  };

  // Limpar estado de erro após 5 segundos
  useEffect(() => {
    if (errorState) {
      const timer = setTimeout(() => {
        setErrorState(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [errorState]);

  return (
    <div className="fixed inset-0 bg-black">
      <div 
        ref={feedContainerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory"
        onScroll={handleScroll}
      >
        {MOCK_VIDEOS.map((video, index) => (
          <div key={video.id} className="h-full w-full snap-start snap-always">
            <VideoCard
              video={video}
              isActive={index === activeVideoIndex}
              muted={muted}
              onMuteToggle={toggleMute}
              onViewRestaurant={() => handleViewRestaurant(video.restaurantId)}
            />
          </div>
        ))}
      </div>
      
      <div className="fixed right-4 bottom-24 flex flex-col items-center space-y-4 z-10">
        <Button
          size="icon"
          variant="outline"
          className="rounded-full bg-primary/80 hover:bg-primary text-white border-none w-12 h-12"
          onClick={() => openChat(activeVideo.dishName, activeVideo.restaurantName)}
          disabled={!!errorState}
        >
          <MessageCircle size={24} />
        </Button>
        {errorState && (
          <span className="bg-black/80 text-white px-2 py-1 rounded text-xs">
            {errorState}
          </span>
        )}
      </div>
      
      <VideoControls 
        video={activeVideo}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onMuteToggle={toggleMute}
        muted={muted}
      />
    </div>
  );
};

export default VideoFeed;
