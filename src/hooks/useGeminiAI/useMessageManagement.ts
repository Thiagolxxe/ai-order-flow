
import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { OrderContext, generateGeminiResponse, ChatMessage } from '@/services/gemini';
import { Message } from './types';

export const useMessageManagement = (context: OrderContext) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { user } = useUser();

  // Generate initial welcome message
  useEffect(() => {
    const generateWelcomeMessage = async () => {
      if (messages.length === 0) {
        // Create basic welcome message
        let welcomeContent = 'Olá! Sou a assistente virtual do DelivGo. Como posso ajudar você hoje?';
        
        // Personalize if we have user profile
        if (context.userProfile?.nome) {
          welcomeContent = `Olá ${context.userProfile.nome}! Sou a assistente virtual do DelivGo. Como posso ajudar você hoje?`;
        }
        
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: welcomeContent,
          timestamp: new Date()
        };
        
        setMessages([welcomeMessage]);
        
        // Generate suggestions based on context
        if (user?.id) {
          try {
            const response = await generateGeminiResponse(
              "Gere algumas sugestões iniciais para o usuário baseadas no contexto atual. Formato SUGGESTIONS: sugestão 1, sugestão 2, sugestão 3",
              context
            );
            
            if (response.suggestions) {
              setSuggestions(response.suggestions);
            }
          } catch (error) {
            console.error('Error generating initial suggestions:', error);
            // Continue without suggestions
          }
        }
      }
    };
    
    generateWelcomeMessage();
  }, [context, user?.id, messages.length]);

  // Add a message to the state
  const addMessage = useCallback((message: Message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  }, []);

  // Convert messages to Gemini format
  const convertToGeminiFormat = useCallback((msgs: Message[]): ChatMessage[] => {
    return msgs.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
  }, []);

  return {
    messages,
    setMessages,
    suggestions,
    setSuggestions,
    addMessage,
    convertToGeminiFormat
  };
};
