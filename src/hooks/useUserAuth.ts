
import { useState } from 'react';
import { toast } from 'sonner';
import { User, Session } from '@/types/user';
import { apiService } from '@/services/apiService';
import { httpClient } from '@/utils/httpClient';
import { SESSION_STORAGE_KEY } from '@/config/apiConfig';

/**
 * Hook for user authentication functionality
 */
export const useUserAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  /**
   * Sign in a user with email and password
   */
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Validate input
      if (!email || !password) {
        toast.error('Email e senha são obrigatórios');
        return { error: { message: 'Email e senha são obrigatórios' } };
      }
      
      console.log('Attempting to connect to server for authentication...');
      
      // Use the authService for login
      const { data, error } = await apiService.auth.signIn({ email, password });
      
      if (error) {
        console.error('Authentication error:', error);
        toast.error(error.message || 'Falha na autenticação');
        return { error };
      }
      
      if (!data || !data.session) {
        console.error('No session data returned from server');
        toast.error('Erro no serviço de autenticação');
        return { error: { message: 'Erro no serviço de autenticação' } };
      }
      
      // Update state with user info and session
      setUser(data.session.user as User);
      setSession({ access_token: data.session.access_token });
      
      // Try to get user role
      if (data.session.role) {
        setRole(data.session.role);
      }
      
      toast.success('Login realizado com sucesso!');
      return { data };
      
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Falha na autenticação');
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign up a new user
   */
  const signUp = async (credentials: any) => {
    setIsLoading(true);
    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        toast.error('Email e senha são obrigatórios');
        return { error: { message: 'Email e senha são obrigatórios' } };
      }
      
      // Use the authService for registration
      const { data, error } = await apiService.auth.signUp(credentials);
      
      if (error) {
        console.error('Registration error:', error);
        toast.error(error.message || 'Erro ao criar conta');
        return { error };
      }
      
      if (!data || !data.session) {
        console.error('No session data returned from server');
        toast.error('Erro no serviço de registro');
        return { error: { message: 'Erro no serviço de registro' } };
      }
      
      // Update state with user info and session
      setUser(data.session.user as User);
      setSession({ access_token: data.session.access_token });
      
      // Set default role for new users
      if (data.session.role) {
        setRole(data.session.role);
      } else {
        setRole('cliente');
      }
      
      toast.success('Conta criada com sucesso!');
      return { data };
      
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Erro ao criar conta');
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    setIsLoading(true);
    try {
      // Call the auth service to logout
      await apiService.auth.signOut();
      
      // Clear state
      setUser(null);
      setSession(null);
      setRole(null);
      
      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'Erro ao fazer logout');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update user data
   */
  const updateUserData = (data: Partial<User>) => {
    if (user) {
      setUser({
        ...user,
        ...data
      });
    }
  };

  return {
    user,
    setUser,
    session,
    setSession,
    isLoading,
    setIsLoading,
    role,
    setRole,
    signIn,
    signUp,
    signOut,
    updateUserData
  };
};
