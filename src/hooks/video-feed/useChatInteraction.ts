
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useGeminiAI } from '@/hooks/useGeminiAI';

export const useChatInteraction = (setErrorState: (error: string | null) => void) => {
  const { sendMessage } = useGeminiAI();
  
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
  }, [sendMessage, setErrorState]);

  return { openChat };
};
