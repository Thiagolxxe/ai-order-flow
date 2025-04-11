
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Video, VideoAnalytics } from './types';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/apiService';

export const useVideoInteractions = (
  setLikedVideos: React.Dispatch<React.SetStateAction<string[]>>
) => {
  const navigate = useNavigate();
  const [sharingState, setSharingState] = useState<Record<string, boolean>>({});
  
  const handleViewRestaurant = useCallback((restaurantId: string) => {
    navigate(`/restaurants/${restaurantId}`);
  }, [navigate]);

  const handleLike = useCallback(async (videoId: string) => {
    try {
      setLikedVideos(prev => {
        const newLikes = [...prev];
        const isLiked = newLikes.includes(videoId);
        
        if (isLiked) {
          // Unlike the video
          apiService.videos.unlikeVideo(videoId).catch(error => {
            console.error("Error unliking video:", error);
            toast.error("Erro ao remover curtida. Tente novamente.");
          });
          
          toast.success("Curtida removida");
          return newLikes.filter(id => id !== videoId);
        } else {
          // Like the video
          apiService.videos.likeVideo(videoId).catch(error => {
            console.error("Error liking video:", error);
            toast.error("Erro ao curtir vídeo. Tente novamente.");
          });
          
          toast.success("Vídeo curtido!");
          return [...newLikes, videoId];
        }
      });
    } catch (error) {
      console.error("Error in handleLike:", error);
      toast.error("Ocorreu um erro ao processar sua curtida.");
    }
  }, [setLikedVideos]);

  const handleShare = useCallback(async (video: Video) => {
    try {
      setSharingState(prev => ({ ...prev, [video.id]: true }));
      
      // Gerar metadados otimizados para compartilhamento
      const { data: metadataResult, error: metadataError } = await apiService.videos.generateShareMetadata(
        video.id, 
        'auto'
      );
      
      if (metadataError) {
        throw new Error(metadataError.message);
      }
      
      // Registrar evento de compartilhamento na API
      const sharePromise = apiService.videos.shareVideo(
        video.id, 
        'share_api',
        metadataResult
      );
      
      // Em navegadores modernos, usar a Web Share API
      if (navigator.share) {
        await navigator.share({
          title: metadataResult?.title || `${video.dishName} - ${video.restaurantName}`,
          text: metadataResult?.description || video.description,
          url: metadataResult?.url || window.location.href,
        });
        
        toast.success(`Vídeo compartilhado com sucesso!`);
      } else {
        // Fallback para navegadores que não suportam Web Share API
        // Exibir modal com opções de compartilhamento
        navigator.clipboard.writeText(metadataResult?.url || window.location.href);
        toast.success("Link copiado para a área de transferência!");
      }
      
      // Aguardar o registro na API ser concluído
      await sharePromise;
      
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Não foi possível compartilhar este vídeo');
    } finally {
      setSharingState(prev => ({ ...prev, [video.id]: false }));
    }
  }, []);

  const handleComment = useCallback(async (video: Video) => {
    toast.info(`Comentários para ${video.dishName} estarão disponíveis em breve!`);
  }, []);

  return {
    handleViewRestaurant,
    handleLike,
    handleShare,
    handleComment,
    sharingState
  };
};
