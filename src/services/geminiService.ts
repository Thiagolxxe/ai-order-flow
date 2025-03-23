
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { supabase } from '@/integrations/supabase/client';

// Google Gemini API key - Note: In production, this should be stored in environment variables
const GEMINI_API_KEY = 'AIzaSyBDh7U_XkWQgPO8Mhu8y60T2eyRwCmJy5c';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Context types
export type OrderContext = {
  restaurantId?: string;
  restaurantName?: string;
  cartItems?: any[];
  previousOrders?: any[];
  userAddress?: any;
  suggestions?: string[];
};

// Types for chat messages
type ChatMessage = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

// Types for responses
export interface GeminiResponse {
  responseText: string;
  suggestions?: string[];
  autoFillData?: Record<string, any>;
}

/**
 * Generates a response from Gemini AI based on the user input and context
 */
export const generateGeminiResponse = async (
  userInput: string,
  context?: OrderContext,
  previousMessages?: ChatMessage[]
): Promise<GeminiResponse> => {
  try {
    // Create prompt with context
    let systemPrompt = `Você é um assistente virtual para um aplicativo de entrega de comida chamado DelivGo. 
    Você ajuda os usuários a fazer pedidos, acompanhar seus pedidos e responder perguntas sobre restaurantes e itens do menu.
    Seja amigável, prestativo e conciso. Se você não souber algo, diga isso e ofereça ajuda com outra coisa.
    IMPORTANTE: Responda SEMPRE em português do Brasil, independente do idioma da pergunta.`;

    // Add context information if available
    if (context) {
      if (context.restaurantName) {
        systemPrompt += `\nO usuário está atualmente visualizando ${context.restaurantName}.`;
      }
      
      if (context.cartItems && context.cartItems.length > 0) {
        systemPrompt += `\nO carrinho do usuário contém: ${context.cartItems.map(item => 
          `${item.quantity}x ${item.name} (R$${item.price.toFixed(2)})`).join(', ')}`;
      }
      
      if (context.previousOrders && context.previousOrders.length > 0) {
        systemPrompt += `\nPedidos anteriores: ${context.previousOrders.map(order => 
          `Pedido #${order.numero_pedido} de ${order.restaurante_nome}`).join(', ')}`;
      }
    }

    // Get the generative model (Gemini Pro)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Configure safety settings
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    // Initialize chat history
    let history: ChatMessage[] = [];
    
    // Add system prompt if we don't have previous messages
    if (!previousMessages || previousMessages.length === 0) {
      history = [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "Entendido. Vou ajudar os usuários com suas necessidades de entrega de comida como assistente do DelivGo, sempre respondendo em português." }],
        },
      ];
    } else {
      // If we have a conversation history, prepend the system prompt as the first exchange
      history = [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "Entendido. Vou ajudar os usuários com suas necessidades de entrega de comida como assistente do DelivGo, sempre respondendo em português." }],
        },
        ...previousMessages
      ];
    }

    // Create a chat session with history
    const chat = model.startChat({
      safetySettings,
      history,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Generate a response using the current message
    const result = await chat.sendMessage(userInput);
    const responseText = result.response.text();
    
    // Parse potential suggestions or auto-fill data from the response
    const suggestions = extractSuggestions(responseText);
    const autoFillData = extractAutoFillData(responseText);

    return {
      responseText,
      suggestions,
      autoFillData
    };
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    return {
      responseText: 'Desculpe, não consegui processar sua solicitação. Por favor, tente novamente mais tarde.'
    };
  }
};

/**
 * Extract suggestions from Gemini response text
 */
const extractSuggestions = (text: string): string[] | undefined => {
  // Look for patterns like "SUGGESTIONS: item1, item2, item3"
  const suggestionMatch = text.match(/SUGGESTIONS:\s*([\s\S]+?)(?:\n\n|\n|$)/i);
  if (suggestionMatch && suggestionMatch[1]) {
    return suggestionMatch[1].split(',').map(s => s.trim()).filter(s => s);
  }
  return undefined;
};

/**
 * Extract auto-fill data from Gemini response text
 */
const extractAutoFillData = (text: string): Record<string, any> | undefined => {
  // Look for patterns like "AUTOFILL: {"field": "value", ...}"
  const autofillMatch = text.match(/AUTOFILL:\s*(\{[\s\S]+?\})(?:\n\n|\n|$)/i);
  if (autofillMatch && autofillMatch[1]) {
    try {
      return JSON.parse(autofillMatch[1]);
    } catch (e) {
      console.error('Failed to parse autofill data:', e);
    }
  }
  return undefined;
};

/**
 * Fetch user context information from database
 */
export const fetchUserContext = async (userId?: string): Promise<OrderContext> => {
  if (!userId) return {};
  
  try {
    const context: OrderContext = {};
    
    // Fetch user's previous orders
    const { data: orderData, error: orderError } = await supabase
      .from('pedidos')
      .select(`
        id,
        numero_pedido,
        restaurante_id,
        restaurantes (
          nome
        ),
        total,
        criado_em
      `)
      .eq('cliente_id', userId)
      .order('criado_em', { ascending: false })
      .limit(5);
    
    if (!orderError && orderData) {
      context.previousOrders = orderData.map(order => ({
        ...order,
        restaurante_nome: order.restaurantes?.nome || 'Restaurante'
      }));
    }
    
    // Fetch user's default address
    const { data: addressData, error: addressError } = await supabase
      .from('enderecos')
      .select('*')
      .eq('usuario_id', userId)
      .eq('isdefault', true)
      .single();
    
    if (!addressError && addressData) {
      context.userAddress = addressData;
    }
    
    return context;
  } catch (error) {
    console.error('Error fetching user context:', error);
    return {};
  }
};
