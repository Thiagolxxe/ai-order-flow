
import React, { useEffect, useState } from 'react';
import VideoFeedContainer from '@/components/video-feed/VideoFeedContainer';
import VideoControls from '@/components/video-feed/VideoControls';
import { useVideoFeed } from '@/hooks/useVideoFeed';
import { Skeleton } from '@/components/ui/skeleton';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Info, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MOCK_VIDEOS } from '@/hooks/video-feed/mock-data';

// Type definition for Navigator with NetworkInformation
interface ExtendedNavigator extends Navigator {
  connection?: {
    effectiveType?: string;
    addEventListener?: (type: string, listener: EventListener) => void;
    removeEventListener?: (type: string, listener: EventListener) => void;
  };
}

const VideoFeed = () => {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [isUsingMockData, setIsUsingMockData] = useState<boolean>(false);
  
  const {
    activeVideoIndex,
    muted,
    errorState,
    activeVideo,
    feedContainerRef,
    likedVideos,
    handleScroll,
    handleNext,
    handlePrevious,
    toggleMute,
    handleViewRestaurant,
    handleLike,
    handleShare,
    handleComment,
    videos,
    isLoading,
    resetErrorState,
    useMockData
  } = useVideoFeed();
  
  // Verificar estado de conexão
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success("Conexão restaurada", {
        icon: <Wifi className="h-4 w-4 text-green-500" />,
      });
      resetErrorState?.();
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      toast.error("Sem conexão com internet", {
        icon: <WifiOff className="h-4 w-4 text-red-500" />,
      });
      
      // Ativar dados simulados quando offline
      if (!isUsingMockData) {
        setIsUsingMockData(true);
        useMockData?.();
        toast.info("Usando dados de demonstração", { duration: 5000 });
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Verificar conexão com API logo na inicialização
    const checkApiConnection = async () => {
      try {
        const response = await fetch('https://deliverai.onrender.com/api/health', { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000) // 5 segundos timeout
        });
        
        if (!response.ok) {
          // Se a API responder mas com erro, usar dados mock
          if (!isUsingMockData) {
            setIsUsingMockData(true);
            useMockData?.();
            toast.info("Usando dados de demonstração devido a problemas no servidor", { duration: 5000 });
          }
        }
      } catch (error) {
        // Se a API não responder, usar dados mock
        if (!isUsingMockData) {
          setIsUsingMockData(true);
          useMockData?.();
          toast.info("Usando dados de demonstração devido a problemas de conexão", { duration: 5000 });
        }
      }
    };
    
    checkApiConnection();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isUsingMockData, resetErrorState, useMockData]);
  
  // Set proper metadata for OpenGraph when sharing
  useEffect(() => {
    if (activeVideo) {
      // Update document title when active video changes
      document.title = `${activeVideo.dishName} - ${activeVideo.restaurantName} | DeliveryAI`;
    }
  }, [activeVideo]);
  
  // Show adaptive streaming notice
  useEffect(() => {
    // Safely access the connection property from navigator with type assertion
    const extendedNavigator = navigator as ExtendedNavigator;
    const connection = extendedNavigator.connection;
    
    if (connection && (connection.effectiveType === '2g' || connection.effectiveType === '3g')) {
      setTimeout(() => {
        toast.info("Qualidade de vídeo ajustada para sua conexão atual", {
          duration: 3000,
        });
      }, 2000);
    }
  }, []);
  
  const handleRefresh = () => {
    window.location.reload();
  };
  
  // Mostrar indicador offline quando não há conexão
  if (isOffline) {
    toast.warning("Você está offline. Alguns recursos podem não funcionar corretamente.", {
      duration: 5000,
    });
  }
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="space-y-4 w-full max-w-sm px-4">
          <Skeleton className="h-[70vh] w-full bg-gray-800 rounded-lg" />
          <div className="flex justify-between">
            <Skeleton className="h-10 w-24 bg-gray-800" />
            <Skeleton className="h-10 w-24 bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }
  
  if (errorState && !isUsingMockData) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center p-4 max-w-md">
          <div className="mb-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <h2 className="text-xl font-bold mb-2">Erro ao carregar vídeos</h2>
            <p className="mb-4">{errorState}</p>
          </div>
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Problema de conexão</AlertTitle>
            <AlertDescription>
              Não foi possível estabelecer conexão com o servidor. Verifique sua internet e tente novamente.
            </AlertDescription>
          </Alert>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
            <Button 
              onClick={() => {
                useMockData?.();
                setIsUsingMockData(true);
              }} 
              variant="default" 
              className="flex items-center gap-2 mt-2 sm:mt-0"
            >
              <Info className="h-4 w-4" />
              Usar dados de demonstração
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (videos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center p-4 max-w-md">
          <Info className="h-12 w-12 text-blue-500 mx-auto mb-2" />
          <h2 className="text-xl font-bold mb-2">Nenhum vídeo encontrado</h2>
          <p className="mb-4">Estamos preparando novos conteúdos para você. Tente novamente mais tarde.</p>
          <Alert className="mb-4">
            <AlertTitle>Modo de demonstração</AlertTitle>
            <AlertDescription>
              Você está vendo vídeos de demonstração enquanto trabalhamos para trazer mais conteúdo.
            </AlertDescription>
          </Alert>
          <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        {activeVideo && (
          <>
            <title>{`${activeVideo.dishName} - ${activeVideo.restaurantName}`}</title>
            <meta property="og:title" content={activeVideo.dishName} />
            <meta property="og:description" content={activeVideo.description} />
            <meta property="og:image" content={activeVideo.thumbnailUrl} />
            <meta property="og:type" content="video" />
            <meta property="og:video" content={activeVideo.videoUrl} />
            <meta name="twitter:card" content="player" />
            <meta name="twitter:title" content={activeVideo.dishName} />
            <meta name="twitter:description" content={activeVideo.description} />
            <meta name="twitter:image" content={activeVideo.thumbnailUrl} />
          </>
        )}
      </Helmet>
      
      <div className="fixed inset-0 bg-black">
        {isOffline && (
          <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-center py-1 text-xs z-50">
            <WifiOff className="h-3 w-3 inline-block mr-1" /> Você está offline. Usando dados armazenados.
          </div>
        )}
        
        {isUsingMockData && !isOffline && (
          <div className="absolute top-0 left-0 right-0 bg-amber-600 text-white text-center py-1 text-xs z-50">
            <Info className="h-3 w-3 inline-block mr-1" /> Usando dados de demonstração
          </div>
        )}
        
        <VideoFeedContainer
          videos={videos}
          activeVideoIndex={activeVideoIndex}
          muted={muted}
          likedVideos={likedVideos || []}
          onMuteToggle={toggleMute}
          onViewRestaurant={handleViewRestaurant}
          onLike={handleLike}
          onShare={handleShare}
          onComment={handleComment}
          containerRef={feedContainerRef}
          onScroll={handleScroll}
        />
        
        <VideoControls 
          video={activeVideo}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onMuteToggle={toggleMute}
          muted={muted}
        />
      </div>
    </>
  );
};

export default VideoFeed;
