
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Tipos de funções de usuário
type UserRole = 'cliente' | 'restaurante' | 'entregador' | 'admin' | null;

type AddressType = {
  id: string;
  label: string;
  endereco: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  isDefault: boolean;
};

interface UserContextType {
  user: User | null;
  session: Session | null;
  userId: string | null;
  isAuthenticated: boolean;
  userRole: UserRole;
  isLoading: boolean;
  addresses: AddressType[];
  defaultAddress: AddressType | null;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<{ error: any }>;
  signup: (email: string, password: string, userData: any) => Promise<{ error: any, data: any }>;
  updateProfile: (data: any) => Promise<{ error: any }>;
  refreshUser: () => Promise<void>;
  setUserRole: (role: UserRole) => void;
  loadAddresses: () => Promise<void>;
  addAddress: (address: Omit<AddressType, 'id'>) => Promise<{ error: any, data: any }>;
  updateAddress: (address: AddressType) => Promise<{ error: any }>;
  deleteAddress: (addressId: string) => Promise<{ error: any }>;
  setDefaultAddress: (addressId: string) => Promise<{ error: any }>;
  createSuperUser: () => Promise<{ error: any, data: any }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<AddressType | null>(null);
  const { toast } = useToast();

  // Inicialização e controle da sessão
  useEffect(() => {
    // Primeiro configuramos o listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setUserId(session?.user?.id ?? null);
        if (session?.user) {
          await fetchUserRole(session.user.id);
          await loadAddresses();
        } else {
          setUserRole(null);
          setAddresses([]);
          setDefaultAddress(null);
        }
      }
    );

    // Depois verificamos se já existe uma sessão
    const initSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        setUserId(session?.user?.id ?? null);
        
        if (session?.user) {
          await fetchUserRole(session.user.id);
          await loadAddresses();
        }
      } catch (error) {
        console.error('Erro ao inicializar sessão:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Buscar função do usuário (cliente, restaurante, entregador)
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('funcoes_usuario')
        .select('funcao')
        .eq('usuario_id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar função do usuário:', error);
        return;
      }

      setUserRole(data?.funcao as UserRole || 'cliente');
    } catch (error) {
      console.error('Erro ao buscar função do usuário:', error);
    }
  };

  // Login de usuário
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Logout de usuário
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Erro ao sair",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Logout realizado com sucesso",
        description: "Até logo!",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Cadastro de usuário
  const signup = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: userData.nome,
            sobrenome: userData.sobrenome,
          },
        },
      });

      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }

      toast({
        title: "Cadastro realizado com sucesso",
        description: "Seja bem-vindo ao DeliverAI!",
      });

      return { error: null, data };
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
      return { error, data: null };
    }
  };

  // Atualizar perfil
  const updateProfile = async (profileData: any) => {
    try {
      if (!user) return { error: new Error('Usuário não autenticado') };

      const { error } = await supabase
        .from('perfis')
        .update(profileData)
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Erro ao atualizar perfil",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso!",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Recarregar dados do usuário
  const refreshUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await fetchUserRole(user.id);
        await loadAddresses();
      }
    } catch (error) {
      console.error('Erro ao recarregar dados do usuário:', error);
    }
  };

  // Carregar endereços do usuário
  const loadAddresses = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('enderecos')
        .select('*')
        .eq('usuario_id', user.id)
        .order('isDefault', { ascending: false });

      if (error) {
        console.error('Erro ao carregar endereços:', error);
        return;
      }

      const formattedAddresses: AddressType[] = data.map(addr => ({
        id: addr.id,
        label: addr.label,
        endereco: addr.endereco,
        complemento: addr.complemento,
        bairro: addr.bairro,
        cidade: addr.cidade,
        estado: addr.estado,
        cep: addr.cep,
        isDefault: addr.isDefault
      }));

      setAddresses(formattedAddresses);
      
      const defaultAddr = formattedAddresses.find(addr => addr.isDefault) || null;
      setDefaultAddress(defaultAddr);
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
    }
  };

  // Adicionar endereço
  const addAddress = async (address: Omit<AddressType, 'id'>) => {
    try {
      if (!user) return { error: new Error('Usuário não autenticado'), data: null };

      // Se for o primeiro endereço ou marcado como padrão, atualiza todos os outros como não padrão
      if (address.isDefault || addresses.length === 0) {
        if (addresses.length > 0) {
          await supabase
            .from('enderecos')
            .update({ isDefault: false })
            .eq('usuario_id', user.id);
        }
      }

      const { data, error } = await supabase
        .from('enderecos')
        .insert({
          ...address,
          usuario_id: user.id,
          isDefault: address.isDefault || addresses.length === 0 // Se for o primeiro endereço, marca como padrão
        })
        .select();

      if (error) {
        toast({
          title: "Erro ao adicionar endereço",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }

      toast({
        title: "Endereço adicionado",
        description: "Seu endereço foi adicionado com sucesso!",
      });

      // Recarrega os endereços
      await loadAddresses();
      return { error: null, data };
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar endereço",
        description: error.message,
        variant: "destructive",
      });
      return { error, data: null };
    }
  };

  // Atualizar endereço
  const updateAddress = async (address: AddressType) => {
    try {
      if (!user) return { error: new Error('Usuário não autenticado') };

      // Se estiver marcando como padrão, atualiza todos os outros como não padrão
      if (address.isDefault) {
        await supabase
          .from('enderecos')
          .update({ isDefault: false })
          .eq('usuario_id', user.id)
          .neq('id', address.id);
      }

      const { error } = await supabase
        .from('enderecos')
        .update(address)
        .eq('id', address.id)
        .eq('usuario_id', user.id);

      if (error) {
        toast({
          title: "Erro ao atualizar endereço",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Endereço atualizado",
        description: "Seu endereço foi atualizado com sucesso!",
      });

      // Recarrega os endereços
      await loadAddresses();
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar endereço",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Excluir endereço
  const deleteAddress = async (addressId: string) => {
    try {
      if (!user) return { error: new Error('Usuário não autenticado') };

      // Verifica se está excluindo o endereço padrão
      const isDefaultAddress = addresses.find(addr => addr.id === addressId)?.isDefault;

      const { error } = await supabase
        .from('enderecos')
        .delete()
        .eq('id', addressId)
        .eq('usuario_id', user.id);

      if (error) {
        toast({
          title: "Erro ao excluir endereço",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Se excluiu o endereço padrão e ainda há outros endereços, define o primeiro como padrão
      if (isDefaultAddress && addresses.length > 1) {
        const nextDefaultAddress = addresses.find(addr => addr.id !== addressId);
        if (nextDefaultAddress) {
          await setDefaultAddress(nextDefaultAddress.id);
        }
      }

      toast({
        title: "Endereço excluído",
        description: "Seu endereço foi removido com sucesso!",
      });

      // Recarrega os endereços
      await loadAddresses();
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao excluir endereço",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Definir endereço padrão
  const setDefaultAddress = async (addressId: string) => {
    try {
      if (!user) return { error: new Error('Usuário não autenticado') };

      // Primeiro, marca todos os endereços como não padrão
      await supabase
        .from('enderecos')
        .update({ isDefault: false })
        .eq('usuario_id', user.id);

      // Em seguida, marca o endereço selecionado como padrão
      const { error } = await supabase
        .from('enderecos')
        .update({ isDefault: true })
        .eq('id', addressId)
        .eq('usuario_id', user.id);

      if (error) {
        toast({
          title: "Erro ao definir endereço padrão",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Endereço padrão definido",
        description: "Seu endereço padrão foi atualizado com sucesso!",
      });

      // Recarrega os endereços
      await loadAddresses();
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao definir endereço padrão",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Criar usuário superadmin para testes
  const createSuperUser = async () => {
    try {
      // Cria um novo usuário com email superuser@teste.com
      const { data, error } = await supabase.auth.signUp({
        email: 'superuser@teste.com',
        password: 'SuperUser123!',
        options: {
          data: {
            nome: 'Super',
            sobrenome: 'Admin',
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Usuário já existe",
            description: "O super usuário já foi criado. Você pode fazer login com superuser@teste.com e senha SuperUser123!",
          });
          return { error: null, data: { email: 'superuser@teste.com', password: 'SuperUser123!' } };
        }
        
        toast({
          title: "Erro ao criar super usuário",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }

      // Adiciona todas as funções possíveis para o usuário
      if (data.user) {
        const userId = data.user.id;
        
        // Adiciona todas as funções
        const roles = ['cliente', 'restaurante', 'entregador', 'admin'];
        
        for (const role of roles) {
          await supabase
            .from('funcoes_usuario')
            .insert({
              usuario_id: userId,
              funcao: role,
            });
        }
      }

      toast({
        title: "Super usuário criado com sucesso",
        description: "Email: superuser@teste.com, Senha: SuperUser123!",
      });

      return { 
        error: null, 
        data: { 
          email: 'superuser@teste.com', 
          password: 'SuperUser123!',
          roles: ['cliente', 'restaurante', 'entregador', 'admin']
        } 
      };
    } catch (error: any) {
      toast({
        title: "Erro ao criar super usuário",
        description: error.message,
        variant: "destructive",
      });
      return { error, data: null };
    }
  };

  const contextValue: UserContextType = {
    user,
    session,
    userId,
    isAuthenticated: !!user,
    userRole,
    isLoading,
    addresses,
    defaultAddress,
    login,
    logout,
    signup,
    updateProfile,
    refreshUser,
    setUserRole,
    loadAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    createSuperUser
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
