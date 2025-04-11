
import { useState } from 'react';
import { toast } from 'sonner';
import { User, Session } from '@/types/user';
import { connectToDatabase } from '@/integrations/mongodb/client';
import { httpClient } from '@/utils/httpClient';
import { SESSION_STORAGE_KEY, API_BASE_URL } from '@/config/apiConfig';

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
      // First, verify MongoDB Atlas connection
      try {
        await connectToDatabase();
        console.log('MongoDB Atlas connection verified before authentication attempt');
      } catch (connectionError) {
        console.error('MongoDB Atlas connection failed:', connectionError);
        return { 
          error: { 
            message: 'Failed to connect to MongoDB Atlas. Please check your internet connection and Atlas configuration.' 
          } 
        };
      }
      
      // Authenticate with Render API
      try {
        console.log('Attempting to connect to:', API_BASE_URL);
        
        // Use httpClient to handle authentication
        const { data, error } = await httpClient.post('api/auth/login', {
          email, 
          password
        });
        
        if (error) {
          throw new Error(error.message || 'Authentication failed');
        }
        
        setUser(data.user as User);
        setSession({ access_token: data.session.access_token });
        
        // Try to check user role from MongoDB Atlas
        try {
          const { db } = await connectToDatabase();
          const userRolesResult = await db.collection('user_roles').findOne({
            userId: data.user.id
          });
          
          if (userRolesResult) {
            setRole(userRolesResult.role);
          }
        } catch (error) {
          console.error('Error checking user role:', error);
        }
        
        // Save session to localStorage
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
          session: {
            user: data.user,
            access_token: data.session.access_token
          },
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        }));
        
        toast.success('Login successful!');
        return {};
      } catch (serverError: any) {
        console.error('Server connection error:', serverError);
        
        // Enhanced error for connection issues
        if (serverError instanceof TypeError && 
           (serverError.message === 'Failed to fetch' || 
            serverError.message.includes('NetworkError'))) {
          return { 
            error: { 
              message: `Cannot connect to the server at ${API_BASE_URL}. Verify your server configuration and network connectivity.`,
              code: 'CONNECTION_ERROR'
            } 
          };
        }
        return { error: serverError };
      }
    } catch (error: any) {
      console.error('General error during login attempt:', error);
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
      // Register with MongoDB server API
      const { data, error } = await httpClient.post('api/auth/register', {
        email: credentials.email,
        password: credentials.password,
        nome: credentials.options?.data?.nome || '',
        sobrenome: credentials.options?.data?.sobrenome || ''
      });
      
      if (error) {
        toast.error(error.message || 'Erro ao criar conta');
        return { error };
      }
      
      setUser(data.user as User);
      setSession({ access_token: data.session.access_token });
      
      // Save session to localStorage
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        session: {
          user: data.user,
          access_token: data.session.access_token
        },
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }));
      
      toast.success('Conta criada com sucesso!');
      return {};
    } catch (error: any) {
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
      // No need to call any API, just remove local session
      setUser(null);
      setSession(null);
      setRole(null);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer logout');
      console.error('Erro ao fazer logout:', error);
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
