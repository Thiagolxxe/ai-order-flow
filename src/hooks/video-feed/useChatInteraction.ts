
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useChatInteraction = (setErrorState: (error: string | null) => void) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const openChat = useCallback((dishName: string, restaurantName: string) => {
    try {
      setIsLoading(true);
      
      // Store the context for the chat
      const chatContext = {
        dishName,
        restaurantName,
        timestamp: new Date().toISOString()
      };
      
      // Save chat context to local storage for the chat page to use
      localStorage.setItem('food_chat_context', JSON.stringify(chatContext));
      
      // Navigate to the chat page with context
      navigate(`/chat/food`);
      
      return true;
    } catch (error) {
      console.error('Error opening chat:', error);
      setErrorState('Não foi possível abrir o chat');
      toast.error('Erro ao abrir o chat');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setErrorState]);

  return {
    openChat,
    isLoading
  };
};
