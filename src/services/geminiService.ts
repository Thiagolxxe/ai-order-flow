
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';

// Google Gemini API key
const GEMINI_API_KEY = 'AIzaSyBDh7U_XkWQgPO8Mhu8y60T2eyRwCmJy5c';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Context types
export type OrderContext = {
  restaurantId?: string;
  restaurantName?: string;
  cartItems?: any[];
  previousOrders?: any[];
  userAddress?: any;
  suggestions?: string[];
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
  context?: OrderContext
): Promise<GeminiResponse> => {
  try {
    // Create prompt with context
    let systemPrompt = `You are an AI assistant for a food delivery app called DelivGo. 
    You help users order food, track their orders, and answer questions about restaurants and menu items.
    Be friendly, helpful, and concise. If you don't know something, say so and offer to help with something else.`;

    // Add context information if available
    if (context) {
      if (context.restaurantName) {
        systemPrompt += `\nThe user is currently looking at ${context.restaurantName}.`;
      }
      
      if (context.cartItems && context.cartItems.length > 0) {
        systemPrompt += `\nThe user's cart contains: ${context.cartItems.map(item => 
          `${item.quantity}x ${item.name} (R$${item.price.toFixed(2)})`).join(', ')}`;
      }
      
      if (context.previousOrders && context.previousOrders.length > 0) {
        systemPrompt += `\nPrevious orders: ${context.previousOrders.map(order => 
          `Order #${order.numero_pedido} from ${order.restaurante_nome}`).join(', ')}`;
      }
    }

    // Make request to Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          },
          {
            role: 'model',
            parts: [{ text: 'I understand. I\'ll help users with their food delivery needs as a DelivGo assistant.' }]
          },
          {
            role: 'user',
            parts: [{ text: userInput }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      })
    });

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
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
