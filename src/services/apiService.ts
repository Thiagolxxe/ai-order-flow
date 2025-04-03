
/**
 * Serviço centralizado para comunicação com a API
 */
import { httpClient } from '@/utils/httpClient';
import { apiConfig } from '@/config/apiConfig';
import { saveSession, removeSession } from '@/utils/authUtils';

export const apiService = {
  // Auth operations
  auth: {
    signUp: async (email: string, password: string, userData: any) => {
      try {
        const { data, error } = await httpClient.post(apiConfig.endpoints.auth.register, {
          email,
          password,
          ...userData
        });
        
        if (error) {
          return { error: { message: error.message || 'Falha no registro' } };
        }
        
        // Armazenar sessão
        saveSession(data.session);
        
        return { data };
      } catch (error) {
        console.error('Sign up error:', error);
        return { error: { message: 'Falha na criação da conta' } };
      }
    },
    
    signIn: async (email: string, password: string) => {
      try {
        const { data, error } = await httpClient.post(apiConfig.endpoints.auth.login, {
          email, 
          password
        });
        
        if (error) {
          return { error: { message: error.message || 'Falha na autenticação' } };
        }
        
        // Armazenar sessão
        saveSession(data.session);
        
        return { data };
      } catch (error) {
        console.error('Sign in error:', error);
        return { error: { message: 'Falha na autenticação' } };
      }
    },
    
    signOut: async () => {
      try {
        // Remover sessão
        removeSession();
        
        return { error: null };
      } catch (error) {
        console.error('Sign out error:', error);
        return { error: { message: 'Falha ao sair' } };
      }
    },
    
    getSession: async () => {
      try {
        // Obter sessão do localStorage
        const sessionStr = localStorage.getItem(apiConfig.SESSION_STORAGE_KEY);
        
        if (!sessionStr) {
          return { data: { session: null } };
        }
        
        const { session, expires_at } = JSON.parse(sessionStr);
        
        // Verificar se a sessão expirou
        if (new Date(expires_at) < new Date()) {
          removeSession();
          return { data: { session: null } };
        }
        
        return { data: { session } };
      } catch (error) {
        console.error('Get session error:', error);
        return { data: { session: null } };
      }
    }
  },
  
  // Restaurant operations
  restaurants: {
    create: async (restaurantData: any) => {
      try {
        const { data, error } = await httpClient.post(
          apiConfig.endpoints.restaurants.base, 
          restaurantData
        );
        
        if (error) {
          return { 
            success: false, 
            error: error.message || 'Falha ao criar restaurante' 
          };
        }
        
        return data;
      } catch (error) {
        console.error('Create restaurant error:', error);
        return { 
          success: false, 
          error: error.message || 'Erro ao criar restaurante' 
        };
      }
    },
    
    getById: async (id: string) => {
      try {
        const { data, error } = await httpClient.get(
          apiConfig.endpoints.restaurants.getById(id)
        );
        
        if (error) {
          return { error: { message: error.message || 'Falha ao buscar restaurante' } };
        }
        
        return { data };
      } catch (error) {
        console.error('Get restaurant error:', error);
        return { error: { message: 'Falha ao buscar restaurante' } };
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
            error: error.message || 'Falha ao registrar entregador' 
          };
        }
        
        return data;
      } catch (error) {
        console.error('Register delivery person error:', error);
        return { 
          success: false, 
          error: error.message || 'Erro ao registrar entregador' 
        };
      }
    },
    
    getProfile: async () => {
      try {
        const { data, error } = await httpClient.get(
          apiConfig.endpoints.delivery.profile
        );
        
        if (error) {
          return { error: { message: error.message || 'Falha ao buscar perfil' } };
        }
        
        return { data };
      } catch (error) {
        console.error('Get delivery profile error:', error);
        return { error: { message: 'Falha ao buscar perfil' } };
      }
    }
  },
  
  // Notifications
  notifications: {
    getByUserId: async () => {
      try {
        const { data, error } = await httpClient.get(
          apiConfig.endpoints.notifications.base
        );
        
        if (error) {
          return { error: { message: error.message || 'Falha ao buscar notificações' } };
        }
        
        return { data };
      } catch (error) {
        console.error('Get notifications error:', error);
        return { error: { message: 'Falha ao buscar notificações' } };
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
            error: error.message || 'Falha ao marcar notificação como lida' 
          };
        }
        
        return { success: true };
      } catch (error) {
        console.error('Mark notification as read error:', error);
        return { success: false, error: error.message };
      }
    }
  }
};
