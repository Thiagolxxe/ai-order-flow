
import { useState, useCallback } from 'react';
import { 
  generateGeminiResponse, 
  handleFunctionCall,
  OrderContext
} from '@/services/gemini';
import { useContextManagement } from './useContextManagement';
import { useMessageManagement } from './useMessageManagement';
import { useAIActions } from './useAIActions';
import { UseGeminiAIProps, UseGeminiAIReturn, Message } from './types';

export * from './types';

export const useGeminiAI = (initialContext?: Partial<OrderContext>): UseGeminiAIReturn => {
  const { context, updateContext } = useContextManagement(initialContext);
  const { 
    messages, 
    setMessages, 
    suggestions, 
    setSuggestions, 
    addMessage, 
    convertToGeminiFormat 
  } = useMessageManagement(context);
  const { processAIAction } = useAIActions();
  const [isLoading, setIsLoading] = useState(false);

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
    
    addMessage(userMessage);
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Convert previous messages to the format expected by Gemini
      const previousMessages = convertToGeminiFormat(messages);
      
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
        
        addMessage(processingMessage);
        
        try {
          // Handle the function call to get the result, passing the context
          const functionResult = await handleFunctionCall(response.functionCall, context);
          
          // Check if we need to perform special actions based on the function result
          const actionPerformed = processAIAction(functionResult);
          
          // Send the function result back to Gemini for final response
          const followUpResponse = await generateGeminiResponse(
            `Por favor, apresente estes resultados para o usuário de forma amigável: ${JSON.stringify(functionResult)}. ${actionPerformed ? 'A ação foi executada com sucesso.' : 'Nenhuma ação automática foi executada.'}`,
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
        } catch (functionError) {
          console.error('Error handling function call:', functionError);
          finalResponseText = 'Desculpe, tive um problema ao processar sua solicitação. Vamos tentar de outra forma?';
        }
        
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
      
      addMessage(assistantMessage);
      
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
      
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [context, messages, processAIAction, addMessage, convertToGeminiFormat, setSuggestions, setMessages]);

  return {
    messages,
    isLoading,
    sendMessage,
    updateContext,
    suggestions,
    context
  };
};
