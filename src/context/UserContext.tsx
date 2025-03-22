import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { Session } from "@supabase/supabase-js";
import {
  AddressType,
  NotificationType,
  UserRole,
} from "@/integrations/supabase/custom-types";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserContextType {
  isAuthenticated: boolean;
  user: any | null;
  session: Session | null;
  role: UserRole | null;
  addresses: AddressType[] | null;
  notifications: NotificationType[] | null;
  isLoading: boolean;
  signIn: (provider: "google" | "github") => Promise<any>;
  signOut: () => Promise<boolean>;
  fetchAddresses: () => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  addAddress: (
    address: Omit<AddressType, "id" | "usuario_id" | "criado_em">
  ) => Promise<{ data: any; error: any }>;
  updateAddress: (address: AddressType) => Promise<{ data: any; error: any }>;
  deleteAddress: (addressId: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const UserProvider: React.FC<Props> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [addresses, setAddresses] = useState<AddressType[] | null>(null);
  const [notifications, setNotifications] = useState<NotificationType[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      
      // Get initial session
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      
      if (initialSession?.user) {
        setUser(initialSession.user);
        setIsAuthenticated(true);
        await fetchUserProfile(initialSession.user.id);
        await fetchAddresses();
        await fetchNotifications();
      }
      
      setIsLoading(false);
      
      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          setSession(newSession);
          
          if (newSession?.user) {
            setUser(newSession.user);
            setIsAuthenticated(true);
            await fetchUserProfile(newSession.user.id);
            await fetchAddresses();
            await fetchNotifications();
          } else {
            setUser(null);
            setIsAuthenticated(false);
            setRole(null);
            setAddresses(null);
            setNotifications(null);
          }
        }
      );
      
      return () => {
        subscription.unsubscribe();
      };
    };

    fetchSession();
  }, []);

  const signIn = async (provider: "google" | "github") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
      console.error("Erro ao fazer login:", error);
    }
  };

  const signOut = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setIsAuthenticated(false);
      setRole(null);
      setAddresses(null);
      setNotifications(null);
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
      console.error("Erro ao fazer logout:", error);
      return false;
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("perfis")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError);
        setRole("guest");
        return;
      }

      setRole(profile?.funcao || "guest");
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      setRole("guest");
    }
  };

  const fetchAddresses = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("enderecos")
        .select("*")
        .eq("usuario_id", user?.id);

      if (error) {
        console.error("Erro ao buscar endereços:", error);
        setAddresses(null);
        return;
      }

      const formattedAddresses = data.map((address: any) => ({
        id: address.id,
        usuario_id: address.usuario_id,
        label: address.label,
        endereco: address.endereco,
        complemento: address.complemento,
        bairro: address.bairro,
        cidade: address.cidade,
        estado: address.estado,
        cep: address.cep,
        isdefault: address.isdefault,
        criado_em: address.criado_em
      }));

      setAddresses(formattedAddresses);
    } catch (error) {
      console.error("Erro ao buscar endereços:", error);
      setAddresses(null);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAddresses().catch((error) => {
        console.error("Erro ao buscar endereços:", error);
      });
    }
  }, [user?.id]);

  const setDefaultAddressInternal = async (addressId: string) => {
    try {
      // First, update all user addresses to set isdefault to false
      const { error: updateError } = await supabase
        .from("enderecos")
        .update({ isdefault: false })  // Changed to lowercase
        .eq("usuario_id", user?.id);

      if (updateError) {
        console.error("Erro ao atualizar endereços:", updateError);
        return { error: updateError };
      }

      // Then, set the selected address as default
      const { error: setDefaultError } = await supabase
        .from("enderecos")
        .update({ isdefault: true })  // Changed to lowercase
        .eq("id", addressId);

      if (setDefaultError) {
        console.error("Erro ao definir endereço padrão:", setDefaultError);
        return { error: setDefaultError };
      }

      // Update addresses in state
      await fetchAddresses();
      return { error: null };
    } catch (error) {
      console.error("Erro ao definir endereço padrão:", error);
      return { error };
    }
  };

  const setDefaultAddress = async (addressId: string): Promise<void> => {
    const { error } = await setDefaultAddressInternal(addressId);
    if (error) {
      toast({
        title: "Erro ao definir endereço padrão",
        description: "Não foi possível definir o endereço como padrão.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Endereço padrão definido",
        description: "O endereço foi definido como padrão com sucesso.",
      });
    }
  };

  const addAddress = async (address: Omit<AddressType, "id" | "usuario_id" | "criado_em">) => {
    try {
      // Check if this is the first address
      const { data: existingAddresses } = await supabase
        .from("enderecos")
        .select("id")
        .eq("usuario_id", user?.id);

      // If no addresses exist, set this one as default
      const isFirst = !existingAddresses || existingAddresses.length === 0;

      const { data, error } = await supabase
        .from("enderecos")
        .insert({
          ...address,
          usuario_id: user?.id,
          isdefault: isFirst || address.isdefault  // Changed to lowercase
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao adicionar endereço:", error);
        return { data: null, error };
      }

      // If this address is set as default, update other addresses
      if (address.isdefault && !isFirst) {
        await supabase
          .from("enderecos")
          .update({ isdefault: false })  // Changed to lowercase
          .neq("id", data.id)
          .eq("usuario_id", user?.id);
      }

      // Update addresses in state
      await fetchAddresses();
      return { data, error: null };
    } catch (error) {
      console.error("Erro ao adicionar endereço:", error);
      return { data: null, error };
    }
  };

  const updateAddress = async (address: AddressType) => {
    try {
      const { data, error } = await supabase
        .from("enderecos")
        .update({
          ...address,
        })
        .eq("id", address.id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar endereço:", error);
        return { data: null, error };
      }

      // Update addresses in state
      await fetchAddresses();
      return { data, error: null };
    } catch (error) {
      console.error("Erro ao atualizar endereço:", error);
      return { data: null, error };
    }
  };

  const deleteAddress = async (addressId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from("enderecos")
        .delete()
        .eq("id", addressId);

      if (error) {
        console.error("Erro ao remover endereço:", error);
        toast({
          title: "Erro ao remover endereço",
          description: "Não foi possível remover o endereço.",
          variant: "destructive",
        });
        return;
      }

      // Update addresses in state
      await fetchAddresses();
      toast({
        title: "Endereço removido",
        description: "O endereço foi removido com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao remover endereço:", error);
      toast({
        title: "Erro ao remover endereço",
        description: "Não foi possível remover o endereço.",
        variant: "destructive",
      });
    }
  };

  const fetchNotifications = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("notificacoes")
        .select("*")
        .eq("usuario_id", user?.id)
        .order("criado_em", { ascending: false });

      if (error) {
        console.error("Erro ao buscar notificações:", error);
        setNotifications([]);
        return;
      }

      // Ensure the data structure matches NotificationType
      setNotifications(data || []);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
      setNotifications([]);
    }
  };

  const markNotificationAsRead = async (
    notificationId: string
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from("notificacoes")
        .update({ lida: true })
        .eq("id", notificationId);

      if (error) {
        console.error("Erro ao marcar notificação como lida:", error);
        toast({
          title: "Erro ao marcar notificação como lida",
          description: "Não foi possível marcar a notificação como lida.",
          variant: "destructive",
        });
        return;
      }

      // Update notifications in state
      setNotifications(
        notifications?.map((notification) =>
          notification.id === notificationId ? { ...notification, lida: true } : notification
        ) || null
      );
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      toast({
        title: "Erro ao marcar notificação como lida",
        description: "Não foi possível marcar a notificação como lida.",
        variant: "destructive",
      });
    }
  };

  const value: UserContextType = {
    isAuthenticated,
    user,
    session,
    role,
    addresses,
    notifications,
    isLoading,
    signIn,
    signOut,
    fetchAddresses,
    setDefaultAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    fetchNotifications,
    markNotificationAsRead,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
