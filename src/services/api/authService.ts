
/**
 * Auth API service
 */
import { apiConfig, SESSION_STORAGE_KEY } from '@/config/apiConfig';
import { httpClient } from '@/utils/httpClient';
import { saveSession, removeSession, UserSession } from '@/utils/authUtils';
import { AuthSignUpParams, AuthSignInParams, ApiResult } from '@/services/api/types';

export const authService = {
  signUp: async (params: AuthSignUpParams): Promise<ApiResult<{ session?: any }>> => {
    try {
      const { email, password, ...userData } = params;
      
      // Validate input
      if (!email || !password) {
        return { error: { message: 'Email e senha são obrigatórios' } };
      }
      
      // Password validation
      if (password.length < 6) {
        return { error: { message: 'A senha deve ter pelo menos 6 caracteres' } };
      }
      
      const { data, error } = await httpClient.post(apiConfig.endpoints.auth.register, {
        email,
        password,
        ...userData
      });
      
      if (error) {
        console.error('Registration error:', error);
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
      // Validate input
      if (!email || !password) {
        return { error: { message: 'Email e senha são obrigatórios' } };
      }
      
      // Handle demo user
      if (email === 'demo@example.com' && password === 'password123') {
        // Create a mock session for demo user
        const demoSession = {
          user: {
            id: 'demo-user-id',
            email: 'demo@example.com',
            user_metadata: {
              nome: 'Usuário',
              sobrenome: 'Demo'
            }
          },
          access_token: 'demo-token-' + Math.random().toString(36).substring(2),
          refresh_token: 'demo-refresh-token-' + Math.random().toString(36).substring(2)
        };
        
        saveSession(demoSession as UserSession);
        
        return { 
          data: { 
            session: demoSession
          } 
        };
      }
      
      const { data, error } = await httpClient.post(apiConfig.endpoints.auth.login, {
        email, 
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        return { error: { message: error.message || 'Credenciais inválidas' } };
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
};
