
import { SchemaType } from "@google/generative-ai";

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

// Function declarations for Gemini
export const functionDeclarations = [
  {
    name: "buscar_restaurantes",
    description: "Busca restaurantes próximos com base em critérios como tipo de culinária, localização, etc.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        culinaria: {
          type: SchemaType.STRING,
          description: "Tipo de culinária (ex: italiana, japonesa, brasileira)"
        },
        localizacao: {
          type: SchemaType.STRING,
          description: "Localização para buscar (ex: centro, zona sul)"
        },
        preco: {
          type: SchemaType.STRING,
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
      type: SchemaType.OBJECT,
      properties: {
        numero_pedido: {
          type: SchemaType.STRING,
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
      type: SchemaType.OBJECT,
      properties: {
        cidade: {
          type: SchemaType.STRING,
          description: "Nome da cidade (opcional se a localização do usuário estiver no contexto)"
        }
      },
      required: []
    }
  }
];
