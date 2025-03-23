
import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { 
  generateGeminiResponse, 
  fetchUserContext, 
  OrderContext, 
  GeminiResponse 
} from '@/services/geminiService';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useGeminiAI = (initialContext?: Partial<OrderContext>) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<OrderContext>(initialContext || {});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { user } = useUser();

  // Load user context on initialization
  useEffect(() => {
    const loadUserContext = async () => {
      if (user?.id) {
        const userContext = await fetchUserContext(user.id);
        setContext(prevContext => ({
          ...prevContext,
          ...userContext
        }));
      }
    };
    
    loadUserContext();
  }, [user?.id]);

  // Update context
  const updateContext = useCallback((newContext: Partial<OrderContext>) => {
    setContext(prevContext => ({
      ...prevContext,
      ...newContext
    }));
  }, []);

  // Send message to Gemini
  const sendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim()) return;
    
    // Add user message to state
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Generate response from Gemini
      const response = await generateGeminiResponse(messageContent, context);
      
      // Add AI response to messages
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.responseText,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      // Update suggestions
      if (response.suggestions) {
        setSuggestions(response.suggestions);
      }
      
      return response;
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  // Generate initial welcome message
  useEffect(() => {
    const generateWelcomeMessage = async () => {
      if (messages.length === 0) {
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Olá! Sou a assistente virtual do DelivGo. Como posso ajudar você hoje?',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
        
        // Generate suggestions based on context
        if (user?.id) {
          const response = await generateGeminiResponse(
            "Gere algumas sugestões iniciais para o usuário baseadas no contexto atual. Formato SUGGESTIONS: sugestão 1, sugestão 2, sugestão 3",
            context
          );
          
          if (response.suggestions) {
            setSuggestions(response.suggestions);
          }
        }
      }
    };
    
    generateWelcomeMessage();
  }, [context, user?.id]);

  return {
    messages,
    isLoading,
    sendMessage,
    updateContext,
    suggestions,
    context
  };
};
