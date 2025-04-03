
const API_URL = 'http://localhost:5000/api';

export const apiService = {
  // Auth operations
  auth: {
    signUp: async (email: string, password: string, userData: any) => {
      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            ...userData
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          return { error: { message: data.error || 'Falha no registro' } };
        }
        
        // Armazenar sessão no localStorage
        localStorage.setItem('deliveryapp_session', JSON.stringify({
          session: data.session,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
        }));
        
        return { data };
      } catch (error) {
        console.error('Sign up error:', error);
        return { error: { message: 'Falha na criação da conta' } };
      }
    },
    
    signIn: async (email: string, password: string) => {
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          return { error: { message: data.error || 'Falha na autenticação' } };
        }
        
        // Armazenar sessão no localStorage
        localStorage.setItem('deliveryapp_session', JSON.stringify({
          session: data.session,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
        }));
        
        return { data };
      } catch (error) {
        console.error('Sign in error:', error);
        return { error: { message: 'Falha na autenticação' } };
      }
    },
    
    signOut: async () => {
      try {
        // Remover sessão do localStorage
        localStorage.removeItem('deliveryapp_session');
        
        return { error: null };
      } catch (error) {
        console.error('Sign out error:', error);
        return { error: { message: 'Falha ao sair' } };
      }
    },
    
    getSession: async () => {
      try {
        // Obter sessão do localStorage
        const sessionStr = localStorage.getItem('deliveryapp_session');
        
        if (!sessionStr) {
          return { data: { session: null } };
        }
        
        const { session, expires_at } = JSON.parse(sessionStr);
        
        // Verificar se a sessão expirou
        if (new Date(expires_at) < new Date()) {
          localStorage.removeItem('deliveryapp_session');
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
        const sessionStr = localStorage.getItem('deliveryapp_session');
        if (!sessionStr) {
          return { success: false, error: 'Usuário não autenticado' };
        }
        
        const { session } = JSON.parse(sessionStr);
        
        const response = await fetch(`${API_URL}/restaurants`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(restaurantData),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          return { success: false, error: data.error || 'Falha ao criar restaurante' };
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
        const response = await fetch(`${API_URL}/restaurants/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          return { error: { message: data.error || 'Falha ao buscar restaurante' } };
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
        const sessionStr = localStorage.getItem('deliveryapp_session');
        if (!sessionStr) {
          return { success: false, error: 'Usuário não autenticado' };
        }
        
        const { session } = JSON.parse(sessionStr);
        
        const response = await fetch(`${API_URL}/delivery/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(deliveryData),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          return { success: false, error: data.error || 'Falha ao registrar entregador' };
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
        const sessionStr = localStorage.getItem('deliveryapp_session');
        if (!sessionStr) {
          return { error: { message: 'Usuário não autenticado' } };
        }
        
        const { session } = JSON.parse(sessionStr);
        
        const response = await fetch(`${API_URL}/delivery/profile`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          return { error: { message: data.error || 'Falha ao buscar perfil' } };
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
        const sessionStr = localStorage.getItem('deliveryapp_session');
        if (!sessionStr) {
          return { error: { message: 'Usuário não autenticado' } };
        }
        
        const { session } = JSON.parse(sessionStr);
        
        const response = await fetch(`${API_URL}/notifications`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          return { error: { message: data.error || 'Falha ao buscar notificações' } };
        }
        
        return { data };
      } catch (error) {
        console.error('Get notifications error:', error);
        return { error: { message: 'Falha ao buscar notificações' } };
      }
    },
    
    markAsRead: async (id: string) => {
      try {
        const sessionStr = localStorage.getItem('deliveryapp_session');
        if (!sessionStr) {
          return { success: false, error: 'Usuário não autenticado' };
        }
        
        const { session } = JSON.parse(sessionStr);
        
        const response = await fetch(`${API_URL}/notifications/${id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          return { success: false, error: data.error || 'Falha ao marcar notificação como lida' };
        }
        
        return { success: true };
      } catch (error) {
        console.error('Mark notification as read error:', error);
        return { success: false, error: error.message };
      }
    }
  }
};
