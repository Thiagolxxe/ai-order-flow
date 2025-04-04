
import { UserSession } from '@/utils/authUtils';

/**
 * Authentication service
 */
export const authService = {
  /**
   * Get current session
   */
  getSession: async (): Promise<{ data: { session: UserSession | null }}> => {
    // Get session from local storage
    const sessionStr = localStorage.getItem('deliveryapp_session');
    
    if (!sessionStr) {
      return { data: { session: null } };
    }
    
    try {
      const { session, expires_at } = JSON.parse(sessionStr);
      
      // Check if the session expired
      if (expires_at && new Date(expires_at) < new Date()) {
        localStorage.removeItem('deliveryapp_session');
        return { data: { session: null } };
      }
      
      return { data: { session } };
    } catch (error) {
      console.error('Error parsing session:', error);
      return { data: { session: null } };
    }
  },
  
  /**
   * Sign up new user
   */
  signUp: async (email: string, password: string, userData?: any) => {
    try {
      // Here you would implement actual signup logic
      // This is a stub implementation for now
      console.log('Sign up called with:', { email, userData });
      
      const mockUser = { id: 'mock-user-id', email };
      const mockSession: UserSession = { 
        id: 'mock-user-id',
        email,
        user: { ...mockUser, ...userData },
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        role: 'user'
      };
      
      return {
        data: {
          user: mockUser,
          session: mockSession
        },
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.message || 'Error signing up' }
      };
    }
  },
  
  /**
   * Sign in user
   */
  signIn: async (email: string, password: string) => {
    try {
      // Here you would implement actual signin logic
      // This is a stub implementation for now
      console.log('Sign in called with:', { email });
      
      const mockUser = { id: 'mock-user-id', email };
      const mockSession: UserSession = {
        id: 'mock-user-id',
        email,
        user: mockUser,
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        role: 'user'
      };
      
      return {
        data: {
          user: mockUser,
          session: mockSession
        },
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.message || 'Error signing in' }
      };
    }
  },
  
  /**
   * Set session
   */
  setSession: async (session: UserSession) => {
    try {
      // Save session to localStorage
      localStorage.setItem('deliveryapp_session', JSON.stringify({
        session,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }));
      
      return {
        data: { session },
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.message || 'Error setting session' }
      };
    }
  }
};
