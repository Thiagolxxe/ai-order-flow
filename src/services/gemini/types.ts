
// Chat message types
export interface ChatMessage {
  role: string;
  parts: { text: string }[];
}

// Function call response types
export interface FunctionCall {
  name: string;
  arguments: any;
}

export interface FunctionResponse {
  result: string;
  [key: string]: any;
}

// Gemini response types
export interface GeminiResponse {
  responseText: string;
  suggestions?: string[];
  autoFillData?: Record<string, any>;
  functionCall?: FunctionCall;
}

// User context types
export interface UserProfile {
  nome?: string;
  sobrenome?: string;
  nomeCompleto?: string;
  telefone?: string;
}

export interface UserLocation {
  cidade?: string;
  estado?: string;
  cep?: string;
}

export interface PreviousOrder {
  id: string;
  numero_pedido: string;
  restaurante_id: string;
  restaurante_nome?: string;
  total: number;
  criado_em: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface OrderContext {
  userProfile?: UserProfile;
  userAddress?: any;
  userLocation?: UserLocation;
  previousOrders?: PreviousOrder[];
  frequentItems?: string[];
  restaurantId?: string;
  restaurantName?: string;
  cartItems?: CartItem[];
}

// Export function declarations for Gemini
export const functionDeclarations = [
  {
    name: 'get_order_status',
    description: 'Get the status of a user order',
    parameters: {
      type: 'object',
      properties: {
        order_number: {
          type: 'string',
          description: 'The order number to check status for'
        }
      },
      required: ['order_number']
    }
  },
  {
    name: 'search_restaurants',
    description: 'Search for restaurants based on cuisine type, location, or name',
    parameters: {
      type: 'object',
      properties: {
        cuisine: {
          type: 'string',
          description: 'Type of cuisine (e.g., Italian, Japanese)'
        },
        location: {
          type: 'string',
          description: 'City or neighborhood'
        },
        name: {
          type: 'string',
          description: 'Restaurant name or partial name'
        }
      }
    }
  },
  {
    name: 'reorder_previous_meal',
    description: 'Reorder items from a previous order',
    parameters: {
      type: 'object',
      properties: {
        order_number: {
          type: 'string',
          description: 'The order number to reorder items from'
        }
      },
      required: ['order_number']
    }
  }
];
