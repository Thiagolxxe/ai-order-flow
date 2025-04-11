
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
};
