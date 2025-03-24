
import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { 
  generateGeminiResponse, 
  fetchUserContext, 
  OrderContext,
  ChatMessage,
  handleFunctionCall,
  FunctionResponse
} from '@/services/gemini';

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
  const cart = useCart();

  // Create custom cart actions
  const addItem = useCallback((item: any) => {
    if (cart && typeof cart.increaseQuantity === 'function') {
      // Check if item exists in cart
      const existingItem = cart.cartItems.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        // If item exists, increase quantity
        for (let i = 0; i < item.quantity; i++) {
          cart.increaseQuantity(item.id);
        }
      } else {
        // For new items, we would need to have an actual addItem method
        // For now, we'll just show a toast message
        toast.error("Função adicionar item ainda não implementada completamente");
        console.log("Tentando adicionar item:", item);
      }
    }
  }, [cart]);

  // Create custom checkout action
  const startCheckout = useCallback((restaurantId: string) => {
    if (cart && typeof cart.saveCheckoutData === 'function') {
      const success = cart.saveCheckoutData();
      
      if (success) {
        // Redirect to checkout page
        window.location.href = '/checkout';
      } else {
        toast.error("Não foi possível iniciar o checkout");
      }
    }
  }, [cart]);

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

  // Handle function call response and perform actions
  const processAIAction = useCallback((functionResponse: FunctionResponse) => {
    if (functionResponse.action === 'add_to_cart' && functionResponse.item) {
      const item = functionResponse.item;
      
      // Add item to cart using the cart hook
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        restaurantId: item.restaurantId,
        specialInstructions: item.specialInstructions
      });
      
      toast.success(`${item.quantity}x ${item.name} adicionado ao carrinho`);
      return true;
    }
    
    if (functionResponse.action === 'initiate_checkout' && functionResponse.restaurant) {
      // Start checkout process
      startCheckout(functionResponse.restaurant.id);
      
      toast.success(`Iniciando checkout para ${functionResponse.restaurant.name}`);
      return true;
    }
    
    return false;
  }, [addItem, startCheckout]);

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
  }, [context, messages, processAIAction]);

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
