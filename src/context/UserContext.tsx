
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabaseClient } from '@/integrations/supabase/client';
import { connectToDatabase } from '@/integrations/mongodb/client';
import { useNavigate } from 'react-router-dom';

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

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();
  
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
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSession();
    
    // Listen for authentication state changes
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          setUser(session?.user as User || null);
          setSession({ access_token: session?.access_token || '' });
          
          // Check user role when signing in
          if (session?.user) {
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
  }, [navigate]);
  
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast.error(error.message);
        console.error('Erro ao fazer login:', error);
        return { error };
      } else {
        setUser(data.user as User);
        setSession({ access_token: data.session.access_token });
        
        // Check user role when signing in
        try {
          const { db } = await connectToDatabase();
          const userRolesResult = await db.collection('funcoes_usuario').findOne({
            usuario_id: data.user.id
          });
          
          if (userRolesResult && userRolesResult.data) {
            setRole(userRolesResult.data.role_name);
          }
        } catch (error) {
          console.error('Erro ao verificar função do usuário:', error);
        }
        
        localStorage.setItem('userData', JSON.stringify(data.user));
        toast.success('Login realizado com sucesso!');
        navigate('/');
        return {};
      }
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
        navigate('/');
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
        navigate('/login');
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
