import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabaseClient } from '@/integrations/supabase/client';
import { connectToDatabase } from '@/integrations/mongodb/client';

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
        const { data, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          console.error('Erro ao carregar sessão:', error);
          return;
        }
        
        if (data?.session) {
          setUser(data.session.user as User);
          setSession({ access_token: data.session.access_token });
          
          // Check user role
          try {
            const { db } = await connectToDatabase();
            const userRolesResult = await db.collection('funcoes_usuario').findOne({
              usuario_id: data.session.user.id
            });
            
            if (userRolesResult && userRolesResult.data) {
              setRole(userRolesResult.data.role_name);
            }
          } catch (error) {
            console.error('Erro ao verificar função do usuário:', error);
          }
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSession();
    
    // Listen for authentication state changes
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          if (session?.user) {
            setUser(session?.user as User || null);
            setSession({ access_token: session?.access_token || '' });
            
            // Check user role when signing in
            try {
              const { db } = await connectToDatabase();
              const userRolesResult = await db.collection('funcoes_usuario').findOne({
                usuario_id: session.user.id
              });
              
              if (userRolesResult && userRolesResult.data) {
                setRole(userRolesResult.data.role_name);
              }
            } catch (error) {
              console.error('Erro ao verificar função do usuário:', error);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setRole(null);
        }
      }
    );
    
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);
  
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // First try to authenticate with Supabase
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Erro ao fazer login com Supabase:', error);
        
        // If Supabase fails, try to authenticate with server API
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, {
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
          
          // Check user role
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
          
          localStorage.setItem('userData', JSON.stringify(userData.user));
          return {};
        } catch (serverError: any) {
          return { error: serverError };
        }
      } else {
        // Supabase login successful
        setUser(data.user as User);
        setSession({ access_token: data.session.access_token });
        
        // Check user role in MongoDB
        try {
          const { db } = await connectToDatabase();
          const userRolesResult = await db.collection('user_roles').findOne({
            userId: data.user.id
          });
          
          if (userRolesResult) {
            setRole(userRolesResult.role);
          }
        } catch (error) {
          console.error('Erro ao verificar função do usuário:', error);
        }
        
        localStorage.setItem('userData', JSON.stringify(data.user));
        toast.success('Login realizado com sucesso!');
        
        return {};
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
      const { data, error } = await supabaseClient.auth.signUp(credentials);
      if (error) {
        toast.error(error.message);
        console.error('Erro ao criar conta:', error);
        return { error };
      } else {
        setUser(data.user as User);
        if (data.session) {
          setSession({ access_token: data.session.access_token });
        }
        localStorage.setItem('userData', JSON.stringify(data.user));
        toast.success('Conta criada com sucesso!');
        
        // Instead of using navigate directly, we'll return success and let the component handle navigation
        return {};
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        toast.error(error.message);
        console.error('Erro ao fazer logout:', error);
      } else {
        setUser(null);
        setSession(null);
        setRole(null);
        localStorage.removeItem('userData');
        toast.success('Logout realizado com sucesso!');
        
        // The component will handle navigation after logout
        // We won't use navigate here
      }
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
