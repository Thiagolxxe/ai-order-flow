
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerativeModel, FunctionDeclaration } from "@google/generative-ai";
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
  userLocation?: {
    cidade?: string;
    estado?: string;
    cep?: string;
  };
};

// Types for chat messages
export type ChatMessage = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

// Types for function calling
export interface FunctionResponse {
  name: string;
  arguments: Record<string, any>;
}

// Types for responses
export interface GeminiResponse {
  responseText: string;
  suggestions?: string[];
  autoFillData?: Record<string, any>;
  functionCall?: FunctionResponse;
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

      if (context.userLocation) {
        systemPrompt += `\nLocalização do usuário: ${context.userLocation.cidade || ''}, ${context.userLocation.estado || ''}, ${context.userLocation.cep || ''}`;
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

    // Define function declarations for Gemini's format
    const functionDeclarations: FunctionDeclaration[] = [
      {
        name: "buscar_restaurantes",
        description: "Busca restaurantes próximos com base em critérios como tipo de culinária, localização, etc.",
        parameters: {
          type: "OBJECT",
          properties: {
            culinaria: {
              type: "STRING",
              description: "Tipo de culinária (ex: italiana, japonesa, brasileira)"
            },
            localizacao: {
              type: "STRING",
              description: "Localização para buscar (ex: centro, zona sul)"
            },
            preco: {
              type: "STRING",
              description: "Faixa de preço (barato, médio, caro)"
            }
          },
          required: ["culinaria"]
        }
      },
      {
        name: "verificar_status_pedido",
        description: "Verifica o status atual de um pedido",
        parameters: {
          type: "OBJECT",
          properties: {
            numero_pedido: {
              type: "STRING",
              description: "Número do pedido para verificar"
            }
          },
          required: ["numero_pedido"]
        }
      },
      {
        name: "obter_previsao_tempo",
        description: "Obtém a previsão do tempo para a localização do usuário",
        parameters: {
          type: "OBJECT",
          properties: {
            cidade: {
              type: "STRING",
              description: "Nome da cidade (opcional se a localização do usuário estiver no contexto)"
            }
          },
          required: []
        }
      }
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
      tools: [{
        functionDeclarations
      }]
    });

    // Generate a response using the current message
    const result = await chat.sendMessage(userInput);
    const responseText = result.response.text();
    
    // Check for function calls
    let functionCall: FunctionResponse | undefined;
    const functionCalling = result.response.functionCalls();
    
    if (functionCalling && functionCalling.length > 0) {
      const call = functionCalling[0];
      functionCall = {
        name: call.name,
        arguments: JSON.parse(call.args)
      };
      
      console.log('Function call detected:', functionCall);
    }
    
    // Parse potential suggestions or auto-fill data from the response
    const suggestions = extractSuggestions(responseText);
    const autoFillData = extractAutoFillData(responseText);

    return {
      responseText,
      suggestions,
      autoFillData,
      functionCall
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
 * Handle function calls by executing the appropriate function
 */
export const handleFunctionCall = async (functionCall: FunctionResponse, context?: OrderContext): Promise<string> => {
  if (!functionCall) return '';
  
  try {
    switch (functionCall.name) {
      case 'buscar_restaurantes':
        return await buscarRestaurantes(
          functionCall.arguments.culinaria, 
          functionCall.arguments.localizacao, 
          functionCall.arguments.preco
        );
      
      case 'verificar_status_pedido':
        return await verificarStatusPedido(functionCall.arguments.numero_pedido);
      
      case 'obter_previsao_tempo':
        return await obterPrevisaoTempo(
          functionCall.arguments.cidade || (context?.userLocation?.cidade || '')
        );
      
      default:
        return `Função não implementada: ${functionCall.name}`;
    }
  } catch (error) {
    console.error(`Error executing function ${functionCall.name}:`, error);
    return `Erro ao executar a função ${functionCall.name}. Por favor, tente novamente.`;
  }
};

/**
 * Implementation of function to search restaurants
 */
const buscarRestaurantes = async (
  culinaria: string, 
  localizacao?: string, 
  preco?: string
): Promise<string> => {
  try {
    // Query restaurants from Supabase based on parameters
    let query = supabase
      .from('restaurantes')
      .select('*');
    
    if (culinaria) {
      query = query.ilike('tipo_cozinha', `%${culinaria}%`);
    }
    
    if (localizacao) {
      query = query.ilike('bairro', `%${localizacao}%`);
    }
    
    if (preco) {
      let faixaPreco = '';
      switch (preco) {
        case 'barato': faixaPreco = '$'; break;
        case 'médio': faixaPreco = '$$'; break;
        case 'caro': faixaPreco = '$$$'; break;
      }
      
      if (faixaPreco) {
        query = query.eq('faixa_preco', faixaPreco);
      }
    }
    
    const { data, error } = await query.limit(5);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return `Não encontrei restaurantes com esses critérios. Tente outras opções.`;
    }
    
    return `Encontrei ${data.length} restaurantes:\n` + 
      data.map(r => `- ${r.nome}: ${r.tipo_cozinha} (${r.faixa_preco})`).join('\n');
    
  } catch (error) {
    console.error('Error in buscarRestaurantes:', error);
    return 'Erro ao buscar restaurantes. Por favor, tente novamente.';
  }
};

/**
 * Implementation of function to check order status
 */
const verificarStatusPedido = async (numeroPedido: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        id,
        numero_pedido,
        status,
        restaurante_id,
        restaurantes (nome),
        entregador_id,
        criado_em,
        tempo_estimado
      `)
      .eq('numero_pedido', numeroPedido)
      .maybeSingle();
    
    if (error) throw error;
    
    if (!data) {
      return `Não encontrei nenhum pedido com o número ${numeroPedido}.`;
    }
    
    // Format the status in Portuguese
    let statusPt = 'Desconhecido';
    switch (data.status) {
      case 'pending': statusPt = 'Pendente'; break;
      case 'preparing': statusPt = 'Em preparação'; break;
      case 'ready': statusPt = 'Pronto para entrega'; break;
      case 'delivering': statusPt = 'Em entrega'; break;
      case 'delivered': statusPt = 'Entregue'; break;
      case 'cancelled': statusPt = 'Cancelado'; break;
    }
    
    const restauranteName = data.restaurantes?.nome || 'Restaurante';
    const tempoEstimado = data.tempo_estimado ? String(data.tempo_estimado) : 'Não informado';
    
    return `Pedido #${data.numero_pedido} do ${restauranteName}:\n` +
      `Status: ${statusPt}\n` +
      `Feito em: ${new Date(data.criado_em).toLocaleString('pt-BR')}\n` +
      `Tempo estimado: ${tempoEstimado} minutos`;
    
  } catch (error) {
    console.error('Error in verificarStatusPedido:', error);
    return 'Erro ao verificar o status do pedido. Por favor, tente novamente.';
  }
};

/**
 * Implementation of function to get weather forecast
 */
const obterPrevisaoTempo = async (cidade?: string): Promise<string> => {
  try {
    if (!cidade) {
      return 'Não foi possível identificar sua localização. Por favor, informe a cidade para obter a previsão do tempo.';
    }

    // Normalmente, faríamos uma chamada a uma API real de previsão do tempo aqui
    // Para fins de demonstração, vamos simular uma resposta
    const previsoes = [
      'ensolarado', 'parcialmente nublado', 'nublado', 
      'chuvoso', 'tempestade', 'neve', 'ventoso'
    ];
    const temperaturas = [
      {min: 15, max: 25},
      {min: 18, max: 28},
      {min: 10, max: 20},
      {min: 8, max: 15},
      {min: 20, max: 32}
    ];
    
    // Seleciona uma previsão aleatória para simular
    const previsao = previsoes[Math.floor(Math.random() * previsoes.length)];
    const temperatura = temperaturas[Math.floor(Math.random() * temperaturas.length)];
    
    return `Previsão do tempo para ${cidade}:\n` +
      `Clima: ${previsao}\n` +
      `Temperatura: ${temperatura.min}°C a ${temperatura.max}°C\n` +
      `Umidade: ${Math.floor(Math.random() * 50) + 30}%\n` +
      `Atualizado em: ${new Date().toLocaleString('pt-BR')}`;
    
  } catch (error) {
    console.error('Error in obterPrevisaoTempo:', error);
    return 'Erro ao obter a previsão do tempo. Por favor, tente novamente.';
  }
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
      .maybeSingle();
    
    if (!addressError && addressData) {
      context.userAddress = addressData;
      
      // Add user location information
      context.userLocation = {
        cidade: addressData.cidade,
        estado: addressData.estado,
        cep: addressData.cep
      };
    }
    
    return context;
  } catch (error) {
    console.error('Error fetching user context:', error);
    return {};
  }
};
