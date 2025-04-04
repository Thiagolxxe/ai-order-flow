/**
 * Serviço centralizado para comunicação com a API
 */
import { httpClient } from '@/utils/httpClient';
import { apiConfig, SESSION_STORAGE_KEY } from '@/config/apiConfig';
import { saveSession, removeSession, UserSession } from '@/utils/authUtils';

// Interfaces para autenticação
interface AuthSignUpParams {
  email: string;
  password: string;
  name?: string;
  lastName?: string;
  phone?: string;
}

interface AuthSignInParams {
  email: string;
  password: string;
}

// Type for API responses
interface ApiSuccessResponse<T> {
  data: T;
  error?: never;
}

interface ApiErrorResponse {
  error: { message: string; code?: string; details?: any };
  data?: never;
}

type ApiResult<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Define types for auth responses
interface AuthResponse {
  session: {
    user: any;
    [key: string]: any;
  };
}

export const apiService = {
  // Auth operations
  auth: {
    signUp: async (params: AuthSignUpParams): Promise<ApiResult<{ session?: any }>> => {
      try {
        const { email, password, ...userData } = params;
        const { data, error } = await httpClient.post(apiConfig.endpoints.auth.register, {
          email,
          password,
          ...userData
        });
        
        if (error) {
          return { error: { message: error.message || 'Falha no registro' } };
        }
        
        // Store session
        if (data && typeof data === 'object' && 'session' in data) {
          saveSession(data.session as UserSession);
        }
        
        return { data };
      } catch (error: any) {
        console.error('Sign up error:', error);
        return { error: { message: 'Falha na criação da conta' } };
      }
    },
    
    signIn: async ({ email, password }: AuthSignInParams): Promise<ApiResult<{ session?: any }>> => {
      try {
        const { data, error } = await httpClient.post(apiConfig.endpoints.auth.login, {
          email, 
          password
        });
        
        if (error) {
          return { error: { message: error.message || 'Falha na autenticação' } };
        }
        
        // Store session
        if (data && typeof data === 'object' && 'session' in data) {
          saveSession(data.session as UserSession);
        }
        
        return { data };
      } catch (error: any) {
        console.error('Sign in error:', error);
        return { error: { message: 'Falha na autenticação' } };
      }
    },
    
    signOut: async (): Promise<ApiResult<null>> => {
      try {
        // Call logout API
        await httpClient.post(apiConfig.endpoints.auth.logout);
        
        // Remove local session
        removeSession();
        
        return { data: null };
      } catch (error: any) {
        console.error('Sign out error:', error);
        // Even if API error, remove local session
        removeSession();
        return { error: { message: 'Falha ao sair' } };
      }
    },
    
    getSession: async (): Promise<{ data: { session: UserSession | null } }> => {
      try {
        // Implement session retrieval
        const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
        
        if (!sessionStr) {
          return { data: { session: null } };
        }
        
        try {
          const sessionData = JSON.parse(sessionStr);
          const { session, expires_at } = sessionData;
          
          // Check if session expired
          if (new Date(expires_at) < new Date()) {
            removeSession();
            return { data: { session: null } };
          }
          
          return { data: { session } };
        } catch (e) {
          console.error('Error parsing session:', e);
          return { data: { session: null } };
        }
      } catch (error: any) {
        console.error('Get session error:', error);
        return { data: { session: null } };
      }
    },
    
    refreshToken: async () => {
      try {
        const { data, error } = await httpClient.post(apiConfig.endpoints.auth.refreshToken);
        
        if (error || !(data && typeof data === 'object' && 'session' in data)) {
          // If refresh fails, log out
          removeSession();
          return { error: error || { message: 'Falha ao renovar sessão' } };
        }
        
        // Update session with new token
        saveSession(data.session as UserSession);
        
        return { data };
      } catch (error: any) {
        console.error('Refresh token error:', error);
        removeSession();
        return { error: { message: 'Falha ao renovar sessão' } };
      }
    }
  },
  
  // Restaurant operations
  restaurants: {
    getAll: async (params: any = {}) => {
      try {
        const { data, error } = await httpClient.get(
          apiConfig.endpoints.restaurants.base,
          { params }
        );
        
        if (error) {
          return { error };
        }
        
        return { data };
      } catch (error: any) {
        console.error('Get restaurants error:', error);
        return { error: { message: 'Falha ao buscar restaurantes' } };
      }
    },
    
    getById: async (id: string) => {
      try {
        const { data, error } = await httpClient.get(
          apiConfig.endpoints.restaurants.getById(id)
        );
        
        if (error) {
          return { error };
        }
        
        return { data };
      } catch (error: any) {
        console.error('Get restaurant error:', error);
        return { error: { message: 'Falha ao buscar restaurante' } };
      }
    },
    
    create: async (restaurantData: any) => {
      try {
        const { data, error } = await httpClient.post(
          apiConfig.endpoints.restaurants.base, 
          restaurantData
        );
        
        if (error) {
          return { 
            success: false, 
            error
          };
        }
        
        return { 
          success: true,
          data 
        };
      } catch (error: any) {
        console.error('Create restaurant error:', error);
        return { 
          success: false, 
          error: { message: error.message || 'Erro ao criar restaurante' }
        };
      }
    },
    
    getFeatured: async () => {
      try {
        const { data, error } = await httpClient.get(
          apiConfig.endpoints.restaurants.featured
        );
        
        if (error) {
          return { error };
        }
        
        return { data };
      } catch (error: any) {
        console.error('Get featured restaurants error:', error);
        return { error: { message: 'Falha ao buscar restaurantes em destaque' } };
      }
    },
    
    getNearby: async (lat: number, lng: number) => {
      try {
        const { data, error } = await httpClient.get(
          `${apiConfig.endpoints.restaurants.nearby}?lat=${lat}&lng=${lng}`
        );
        
        if (error) {
          return { error };
        }
        
        return { data };
      } catch (error: any) {
        console.error('Get nearby restaurants error:', error);
        return { error: { message: 'Falha ao buscar restaurantes próximos' } };
      }
    }
  },
  
  // Delivery operations
  delivery: {
    register: async (deliveryData: any) => {
      try {
        const { data, error } = await httpClient.post(
          apiConfig.endpoints.delivery.register,
          deliveryData
        );
        
        if (error) {
          return { 
            success: false, 
            error
          };
        }
        
        return {
          success: true,
          data
        };
      } catch (error: any) {
        console.error('Register delivery person error:', error);
        return { 
          success: false, 
          error: { message: error.message || 'Erro ao registrar entregador' }
        };
      }
    },
    
    getProfile: async () => {
      try {
        const { data, error } = await httpClient.get(
          apiConfig.endpoints.delivery.profile
        );
        
        if (error) {
          return { error };
        }
        
        return { data };
      } catch (error: any) {
        console.error('Get delivery profile error:', error);
        return { error: { message: 'Falha ao buscar perfil' } };
      }
    }
  },
  
  // User operations
  users: {
    getProfile: async () => {
      try {
        const { data, error } = await httpClient.get(
          apiConfig.endpoints.users.profile
        );
        
        if (error) {
          return { error };
        }
        
        return { data };
      } catch (error: any) {
        console.error('Get user profile error:', error);
        return { error: { message: 'Falha ao buscar perfil do usuário' } };
      }
    },
    
    updateProfile: async (profileData: any) => {
      try {
        const { data, error } = await httpClient.patch(
          apiConfig.endpoints.users.updateProfile,
          profileData
        );
        
        if (error) {
          return { error };
        }
        
        return { data };
      } catch (error: any) {
        console.error('Update profile error:', error);
        return { error: { message: 'Falha ao atualizar perfil' } };
      }
    }
  },
  
  // Notifications
  notifications: {
    getAll: async () => {
      try {
        const { data, error } = await httpClient.get(
          apiConfig.endpoints.notifications.base
        );
        
        if (error) {
          return { error };
        }
        
        return { data };
      } catch (error: any) {
        console.error('Get notifications error:', error);
        return { error: { message: 'Falha ao buscar notificações' } };
      }
    },
    
    getByUserId: async () => {
      try {
        const { data, error } = await httpClient.get(
          apiConfig.endpoints.notifications.base
        );
        
        if (error) {
          return { error };
        }
        
        return { data };
      } catch (error: any) {
        console.error('Get user notifications error:', error);
        return { error: { message: 'Falha ao buscar notificações do usuário' } };
      }
    },
    
    markAsRead: async (id: string) => {
      try {
        const { data, error } = await httpClient.patch(
          apiConfig.endpoints.notifications.markAsRead(id)
        );
        
        if (error) {
          return { 
            success: false, 
            error
          };
        }
        
        return { 
          success: true,
          data
        };
      } catch (error: any) {
        console.error('Mark notification as read error:', error);
        return { 
          success: false, 
          error: { message: error.message || 'Falha ao marcar notificação como lida' }
        };
      }
    },
    
    getUnread: async () => {
      try {
        const { data, error } = await httpClient.get(
          apiConfig.endpoints.notifications.unread
        );
        
        if (error) {
          return { error };
        }
        
        return { data };
      } catch (error: any) {
        console.error('Get unread notifications error:', error);
        return { error: { message: 'Falha ao buscar notificações não lidas' } };
      }
    }
  },
  
  // Addresses
  addresses: {
    getAll: async () => {
      try {
        const { data, error } = await httpClient.get(
          apiConfig.endpoints.addresses.base
        );
        
        if (error) {
          return { error };
        }
        
        return { data };
      } catch (error: any) {
        console.error('Get addresses error:', error);
        return { error: { message: 'Falha ao buscar endereços' } };
      }
    },
    
    create: async (addressData: any) => {
      try {
        const { data, error } = await httpClient.post(
          apiConfig.endpoints.addresses.base,
          addressData
        );
        
        if (error) {
          return { 
            success: false, 
            error
          };
        }
        
        return { 
          success: true,
          data
        };
      } catch (error: any) {
        console.error('Create address error:', error);
        return { 
          success: false, 
          error: { message: error.message || 'Falha ao criar endereço' }
        };
      }
    }
  },
  
  // Orders
  orders: {
    create: async (orderData: any) => {
      try {
        const { data, error } = await httpClient.post(
          apiConfig.endpoints.orders.create,
          orderData
        );
        
        if (error) {
          return { 
            success: false, 
            error
          };
        }
        
        return { 
          success: true,
          data
        };
      } catch (error: any) {
        console.error('Create order error:', error);
        return { 
          success: false, 
          error: { message: error.message || 'Falha ao criar pedido' }
        };
      }
    },
    
    getByUser: async () => {
      try {
        const { data, error } = await httpClient.get(
          apiConfig.endpoints.orders.getByUser
        );
        
        if (error) {
          return { error };
        }
        
        return { data };
      } catch (error: any) {
        console.error('Get user orders error:', error);
        return { error: { message: 'Falha ao buscar pedidos' } };
      }
    },
    
    getById: async (id: string) => {
      try {
        const { data, error } = await httpClient.get(
          apiConfig.endpoints.orders.getById(id)
        );
        
        if (error) {
          return { error };
        }
        
        return { data };
      } catch (error: any) {
        console.error('Get order error:', error);
        return { error: { message: 'Falha ao buscar pedido' } };
      }
    },
    
    updateStatus: async (id: string, status: string) => {
      try {
        const { data, error } = await httpClient.patch(
          apiConfig.endpoints.orders.updateStatus(id),
          { status }
        );
        
        if (error) {
          return { 
            success: false, 
            error
          };
        }
        
        return { 
          success: true,
          data
        };
      } catch (error: any) {
        console.error('Update order status error:', error);
        return { 
          success: false, 
          error: { message: error.message || 'Falha ao atualizar status do pedido' }
        };
      }
    }
  }
};
