
import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { 
  generateGeminiResponse, 
  fetchUserContext, 
  OrderContext,
  ChatMessage,
  handleFunctionCall,
  FunctionResponse
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
        
        console.log('Carregado contexto do usuário:', userContext);
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
  const sendMessage = useCallback(async (messageContent: string): Promise<void> => {
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
      // Convert previous messages to the format expected by Gemini
      const previousMessages: ChatMessage[] = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));
      
      // Generate response from Gemini using chat history
      const response = await generateGeminiResponse(messageContent, context, previousMessages);
      
      // Check if there is a function call that needs to be handled
      let finalResponseText = response.responseText;
      
      if (response.functionCall) {
        // Show a message that a function is being executed
        const processingMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Estou processando sua solicitação sobre ${response.functionCall.name.replace('_', ' ')}...`,
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, processingMessage]);
        
        // Handle the function call to get the result, passing the context
        const functionResult = await handleFunctionCall(response.functionCall, context);
        
        // Send the function result back to Gemini for final response
        const followUpResponse = await generateGeminiResponse(
          `Por favor, apresente estes resultados para o usuário de forma amigável: ${functionResult}`,
          context,
          [...previousMessages, {
            role: 'user',
            parts: [{ text: messageContent }]
          }, {
            role: 'model',
            parts: [{ text: response.responseText }]
          }]
        );
        
        finalResponseText = followUpResponse.responseText;
        
        // Remove the processing message
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== processingMessage.id));
      }
      
      // Add AI response to messages
      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: finalResponseText,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      // Update suggestions
      if (response.suggestions) {
        setSuggestions(response.suggestions);
      }
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
    } finally {
      setIsLoading(false);
    }
  }, [context, messages]);

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
          }
        }
      }
    };
    
    generateWelcomeMessage();
  }, [context, user?.id, messages.length]);

  return {
    messages,
    isLoading,
    sendMessage,
    updateContext,
    suggestions,
    context
  };
};
