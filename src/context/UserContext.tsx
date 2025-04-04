
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { apiService } from '@/services/apiService';
import { getCurrentUser, isSessionValid, removeSession } from '@/utils/authUtils';
import { toast } from 'sonner';

// Interface for user data
interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

// Interface for context data
interface UserContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: { message: string } }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error?: { message: string } }>;
  signOut: () => Promise<void>;
  updateUserData: (data: Partial<User>) => void;
}

// Create context
const UserContext = createContext<UserContextData>({} as UserContextData);

// Provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user data
  const initializeUser = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check if session is valid
      if (isSessionValid()) {
        const userData = getCurrentUser();
        
        // If we have a user in the session, update state
        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role
          });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
        removeSession();
      }
    } catch (error) {
      console.error('Error initializing user', error);
      setUser(null);
      removeSession();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load user on mount
  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await apiService.auth.signIn({ email, password });

      if (error) {
        return { error };
      }

      // Type safe check for session in data
      if (data && typeof data === 'object' && 'session' in data && data.session) {
        const sessionData = data.session;
        
        // Check if user exists in session data
        if ('user' in sessionData) {
          setUser(sessionData.user as User);
        }
      }

      return {};
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error: { message: error.message || 'Falha no login' } };
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const { data, error } = await apiService.auth.signUp({
        email,
        password,
        ...userData
      });

      if (error) {
        return { error };
      }

      // Type safe check for session in data
      if (data && typeof data === 'object' && 'session' in data && data.session) {
        const sessionData = data.session;
        
        // Check if user exists in session data
        if ('user' in sessionData) {
          setUser(sessionData.user as User);
        }
      }

      return {};
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error: { message: error.message || 'Falha no registro' } };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await apiService.auth.signOut();
      setUser(null);
      toast.info('Você foi desconectado');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Erro ao desconectar');
    }
  };

  // Update user data
  const updateUserData = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateUserData
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Hook for using the user context
export const useUser = (): UserContextData => {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
};
