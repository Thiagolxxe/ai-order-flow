import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabaseClient } from '@/integrations/supabase/client';
import { connectToDatabase } from '@/integrations/mongodb/client';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  user_metadata: {
    nome: string;
    sobrenome: string;
  };
}

interface AuthContextProps {
  user: User | null;
  session: { access_token: string } | null;
  isLoading: boolean;
  signIn: (credentials: any) => Promise<void>;
  signUp: (credentials: any) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }
      }
    );
    
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [navigate]);
  
  const signIn = async (credentials: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseClient.auth.signIn(credentials);
      if (error) {
        toast.error(error.message);
        console.error('Erro ao fazer login:', error);
      } else {
        setUser(data.user as User);
        setSession({ access_token: data.session.access_token });
        localStorage.setItem('userData', JSON.stringify(data.user));
        toast.success('Login realizado com sucesso!');
        navigate('/');
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
      } else {
        setUser(data.user as User);
        setSession({ access_token: data.session.access_token });
        localStorage.setItem('userData', JSON.stringify(data.user));
        toast.success('Conta criada com sucesso!');
        navigate('/');
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
        localStorage.removeItem('userData');
        toast.success('Logout realizado com sucesso!');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const value: AuthContextProps = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
