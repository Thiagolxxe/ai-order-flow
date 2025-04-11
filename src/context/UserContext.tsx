
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { connectToDatabase } from '@/integrations/mongodb/client';
import { apiService } from '@/services/apiService';
import { SESSION_STORAGE_KEY } from '@/config/apiConfig';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    nome?: string;
    sobrenome?: string;
  };
  name?: string;
  phone?: string;
  address?: string;
}

interface UserContextProps {
  user: User | null;
  session: { access_token: string } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: string | null;
  signIn: (email: string, password: string) => Promise<{error?: any}>;
  signUp: (credentials: any) => Promise<{error?: any}>;
  signOut: () => Promise<void>;
  updateUserData?: (data: Partial<User>) => void;
}

export const UserContext = createContext<UserContextProps | undefined>(undefined);

// Export the useUser hook directly from this file
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  
  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      try {
        // Try to load session from localStorage
        const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
        
        if (!sessionStr) {
          setIsLoading(false);
          return;
        }
        
        try {
          const sessionData = JSON.parse(sessionStr);
          const { session, expires_at } = sessionData;
          
          // Check if session expired
          if (expires_at && new Date(expires_at) < new Date()) {
            localStorage.removeItem(SESSION_STORAGE_KEY);
            setIsLoading(false);
            return;
          }
          
          setUser(session.user as User);
          setSession({ access_token: session.access_token });
          
          // Try to check user role, but don't fail if it can't connect
          try {
            const { db } = await connectToDatabase();
            const userRolesResult = await db.collection('user_roles').findOne({
              userId: session.user.id
            });
            
            if (userRolesResult) {
              setRole(userRolesResult.role);
            }
          } catch (error) {
            console.error('Erro ao verificar função do usuário:', error);
            // Don't fail the whole application if we can't check roles
          }
        } catch (e) {
          console.error('Error parsing session:', e);
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSession();
  }, []);
  
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Authenticate with MongoDB server API
      try {
        const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`;
        console.log('Attempting to connect to:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Falha na autenticação');
        }
        
        const userData = await response.json();
        setUser(userData.user as User);
        setSession({ access_token: userData.session.access_token });
        
        // Try to check user role, but don't fail if it can't connect
        try {
          const { db } = await connectToDatabase();
          const userRolesResult = await db.collection('user_roles').findOne({
            userId: userData.user.id
          });
          
          if (userRolesResult) {
            setRole(userRolesResult.role);
          }
        } catch (error) {
          console.error('Erro ao verificar função do usuário:', error);
        }
        
        // Save session to localStorage
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
          session: {
            user: userData.user,
            access_token: userData.session.access_token
          },
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        }));
        
        toast.success('Login realizado com sucesso!');
        return {};
      } catch (serverError: any) {
        console.error('Server connection error:', serverError);
        // Add enhanced error for connection issues
        if (serverError instanceof TypeError && 
           (serverError.message === 'Failed to fetch' || 
            serverError.message.includes('NetworkError'))) {
          return { 
            error: { 
              message: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet ou se o servidor está disponível.',
              code: 'CONNECTION_ERROR'
            } 
          };
        }
        return { error: serverError };
      }
    } catch (error: any) {
      console.error('Erro geral ao tentar login:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };
  
  const signUp = async (credentials: any) => {
    setIsLoading(true);
    try {
      // Register with MongoDB server API
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          nome: credentials.options?.data?.nome || '',
          sobrenome: credentials.options?.data?.sobrenome || ''
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erro ao criar conta');
        return { error: errorData };
      }
      
      const userData = await response.json();
      setUser(userData.user as User);
      setSession({ access_token: userData.session.access_token });
      
      // Save session to localStorage
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        session: {
          user: userData.user,
          access_token: userData.session.access_token
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
  
  const updateUserData = (data: Partial<User>) => {
    if (user) {
      setUser({
        ...user,
        ...data
      });
    }
  };
  
  const value: UserContextProps = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    role,
    signIn,
    signUp,
    signOut,
    updateUserData
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
