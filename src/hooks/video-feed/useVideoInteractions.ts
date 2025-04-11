
import { useCallback } from 'react';
import { toast } from 'sonner';
import { Video } from './types';
import { useNavigate } from 'react-router-dom';

export const useVideoInteractions = (
  setLikedVideos: React.Dispatch<React.SetStateAction<string[]>>
) => {
  const navigate = useNavigate();
  
  const handleViewRestaurant = useCallback((restaurantId: string) => {
    navigate(`/restaurants/${restaurantId}`);
  }, [navigate]);

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
  }, [setLikedVideos]);

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

  return {
    handleViewRestaurant,
    handleLike,
    handleShare,
    handleComment
  };
};
