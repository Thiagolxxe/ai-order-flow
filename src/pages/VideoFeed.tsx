
import React, { useEffect } from 'react';
import VideoFeedContainer from '@/components/video-feed/VideoFeedContainer';
import VideoControls from '@/components/video-feed/VideoControls';
import { useVideoFeed } from '@/hooks/useVideoFeed';
import { Skeleton } from '@/components/ui/skeleton';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Type definition for Navigator with NetworkInformation
interface ExtendedNavigator extends Navigator {
  connection?: {
    effectiveType?: string;
    addEventListener?: (type: string, listener: EventListener) => void;
    removeEventListener?: (type: string, listener: EventListener) => void;
  };
}

const VideoFeed = () => {
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
    isLoading
  } = useVideoFeed();
  
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
  
  if (errorState) {
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
          <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
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
