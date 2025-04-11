
/**
 * Mock response generators for demo mode
 */
import { ApiResponse } from './types';

/**
 * Generate mock responses for demo mode when server is not available
 */
export const getMockResponse = (endpoint: string, method: string, body: any): ApiResponse => {
  console.log(`📱 Generating mock response for ${method} ${endpoint}`);
  
  // Login endpoint
  if (endpoint.includes('/api/auth/login') && method === 'POST') {
    const mockUser = {
      id: 'demo-user-123',
      email: body?.email || 'demo@example.com',
      user_metadata: {
        nome: 'Usuário',
        sobrenome: 'Demo'
      }
    };
    
    return {
      data: {
        user: mockUser,
        session: {
          access_token: 'demo-token-' + Math.random().toString(36).substring(2),
        }
      },
      error: null,
      status: 200
    };
  }
  
  // Register endpoint
  if (endpoint.includes('/api/auth/register') && method === 'POST') {
    const mockUser = {
      id: 'demo-user-' + Math.random().toString(36).substring(2),
      email: body?.email || 'demo@example.com',
      user_metadata: {
        nome: body?.nome || 'Novo',
        sobrenome: body?.sobrenome || 'Usuário'
      }
    };
    
    return {
      data: {
        user: mockUser,
        session: {
          access_token: 'demo-token-' + Math.random().toString(36).substring(2),
        }
      },
      error: null,
      status: 201
    };
  }
  
  // Health check endpoint
  if (endpoint.includes('/api/check-connection') && method === 'GET') {
    return {
      data: { status: 'ok', message: 'Demo mode: API connection simulated successfully' },
      error: null,
      status: 200
    };
  }
  
  // Restaurants endpoint
  if (endpoint.includes('/api/restaurants') && method === 'GET') {
    return {
      data: {
        restaurants: Array.from({ length: 8 }, (_, i) => ({
          id: `demo-rest-${i}`,
          name: `Restaurante Demo ${i + 1}`,
          cuisine: ['Italiana', 'Japonesa', 'Brasileira', 'Fast Food'][i % 4],
          rating: Math.floor(Math.random() * 5) + 1,
          imageUrl: `https://source.unsplash.com/random/300x200/?restaurant,${i}`,
          deliveryTime: `${Math.floor(Math.random() * 30) + 15}-${Math.floor(Math.random() * 20) + 30} min`,
          deliveryFee: Math.floor(Math.random() * 8) + 3,
        }))
      },
      error: null,
      status: 200
    };
  }
  
  // Default response
  return {
    data: { message: 'Resposta demo gerada para ' + endpoint },
    error: null,
    status: 200
  };
};
