
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { authService, Session } from "@/services/authService";
import { connectToDatabase } from "@/integrations/mongodb/client";
import { toast } from "@/hooks/use-toast";
import { ObjectId } from "mongodb";

interface AddressType {
  id: string;
  userId: string;
  label: string;
  endereco: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  isDefault: boolean;
  createdAt: Date;
}

interface NotificationType {
  id: string;
  userId: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  idRelacionado: string;
  lida: boolean;
  createdAt: Date;
}

type UserRole = 'cliente' | 'restaurante' | 'entregador' | 'admin' | 'guest';

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
  login: (email: string, password: string) => Promise<{ error: any }>;
  signup: (email: string, password: string, userData?: any) => Promise<{ error: any, data?: any }>;
  fetchAddresses: () => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  addAddress: (
    address: Omit<AddressType, "id" | "userId" | "createdAt" | "isDefault"> & { isDefault?: boolean }
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
  const [notifications, setNotifications] = useState<NotificationType[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      
      try {
        // Get initial session
        const { data: { session: initialSession } } = await authService.getSession();
        console.log("Initial session:", initialSession ? "Found" : "Not found");
        setSession(initialSession);
        
        if (initialSession?.user) {
          console.log("User authenticated from initial session:", initialSession.user.id);
          setUser(initialSession.user);
          setIsAuthenticated(true);
          await fetchUserProfile(initialSession.user.id);
          await fetchAddresses();
          await fetchNotifications();
        } else {
          console.log("No active session found");
        }
        
      } catch (error) {
        console.error("Error in session setup:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
    
    // Setup a storage event listener to handle changes in other tabs
    const handleStorageChange = async () => {
      const { data } = await authService.getSession();
      const newSession = data.session;
      
      if (newSession && (!session || newSession.access_token !== session.access_token)) {
        setSession(newSession);
        setUser(newSession.user);
        setIsAuthenticated(true);
        await fetchUserProfile(newSession.user.id);
        await fetchAddresses();
        await fetchNotifications();
      } else if (!newSession && session) {
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
        setRole(null);
        setAddresses(null);
        setNotifications(null);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const signIn = async (provider: "google" | "github") => {
    try {
      // In this basic implementation, we don't support OAuth providers
      // This would require additional setup with a service like Firebase Auth or Auth0
      toast({
        title: "Não implementado",
        description: "O login com provedores sociais não está disponível nesta versão",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
      console.error("Erro ao fazer login:", error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", email);
      const { data, error } = await authService.signInWithPassword(email, password);
      
      if (error) {
        console.error("Login error:", error);
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      console.log("Login successful:", data?.user?.id);
      
      // Update state
      if (data?.session) {
        setSession(data.session);
        setUser(data.user);
        setIsAuthenticated(true);
        await fetchUserProfile(data.user.id);
        await fetchAddresses();
        await fetchNotifications();
      }
      
      return { error: null };
    } catch (error: any) {
      console.error("Login exception:", error);
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signup = async (email: string, password: string, userData?: any) => {
    try {
      console.log("Attempting signup with:", email);
      const { data, error } = await authService.signUp(email, password, userData);
      
      if (error) {
        console.error("Signup error:", error);
        toast({
          title: "Erro ao cadastrar",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }
      
      console.log("Signup successful:", data?.user?.id);
      
      // Update state
      if (data?.session) {
        setSession(data.session);
        setUser(data.user);
        setIsAuthenticated(true);
        await fetchUserProfile(data.user.id);
        await fetchAddresses();
        await fetchNotifications();
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error("Signup exception:", error);
      toast({
        title: "Erro ao cadastrar",
        description: error.message,
        variant: "destructive",
      });
      return { error, data: null };
    }
  };

  const signOut = async (): Promise<boolean> => {
    try {
      console.log("Attempting signout");
      const { error } = await authService.signOut();
      if (error) throw error;
      
      setUser(null);
      setIsAuthenticated(false);
      setSession(null);
      setRole(null);
      setAddresses(null);
      setNotifications(null);
      
      console.log("Signout successful");
      return true;
    } catch (error: any) {
      console.error("Signout error:", error);
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching user profile for:", userId);
      
      const { db } = await connectToDatabase();
      
      // Get user profile
      const profile = await db.collection("profiles").findOne({
        userId: new ObjectId(userId)
      });

      if (!profile) {
        console.log("Profile not found, creating a default one");
        setRole("guest");
        return;
      }

      console.log("Profile data:", profile);

      // Look up the user role
      const userRole = await db.collection("user_roles").findOne({
        userId: new ObjectId(userId)
      });
        
      if (!userRole) {
        console.log("Role not found, setting as guest");
        setRole("guest");
        return;
      }
      
      console.log("User role:", userRole);
      
      // Set the role
      setRole(userRole.role as UserRole || "guest");
    } catch (error) {
      console.error("Exception fetching profile:", error);
      setRole("guest");
    }
  };

  const fetchAddresses = async (): Promise<void> => {
    try {
      if (!user?.id) {
        console.log("Cannot fetch addresses: No user ID");
        setAddresses([]);
        return;
      }
      
      console.log("Fetching addresses for user:", user.id);
      
      const { db } = await connectToDatabase();
      
      const addressesData = await db.collection("addresses")
        .find({ userId: new ObjectId(user.id) })
        .toArray();

      console.log("Addresses data:", addressesData);
      
      const formattedAddresses = addressesData.map((address: any) => ({
        id: address._id.toString(),
        userId: address.userId.toString(),
        label: address.label,
        endereco: address.endereco,
        complemento: address.complemento,
        bairro: address.bairro,
        cidade: address.cidade,
        estado: address.estado,
        cep: address.cep,
        isDefault: address.isDefault,
        createdAt: address.createdAt
      }));

      setAddresses(formattedAddresses);
    } catch (error) {
      console.error("Exception fetching addresses:", error);
      setAddresses([]);
    }
  };

  const setDefaultAddressInternal = async (addressId: string) => {
    try {
      const { db } = await connectToDatabase();
      
      // First, update all user addresses to set isDefault to false
      await db.collection("addresses").updateMany(
        { userId: new ObjectId(user?.id) },
        { $set: { isDefault: false } }
      );

      // Then, set the selected address as default
      await db.collection("addresses").updateOne(
        { _id: new ObjectId(addressId) },
        { $set: { isDefault: true } }
      );

      // Update addresses in state
      await fetchAddresses();
      return { error: null };
    } catch (error) {
      console.error("Error setting default address:", error);
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

  const addAddress = async (address: Omit<AddressType, "id" | "userId" | "createdAt" | "isDefault"> & { isDefault?: boolean }) => {
    try {
      const { db } = await connectToDatabase();
      
      // Check if this is the first address
      const existingAddresses = await db.collection("addresses")
        .find({ userId: new ObjectId(user?.id) })
        .toArray();

      // If no addresses exist, set this one as default
      const isFirst = existingAddresses.length === 0;

      const newAddress = {
        userId: new ObjectId(user?.id),
        ...address,
        isDefault: isFirst || address.isDefault || false,
        createdAt: new Date()
      };

      const result = await db.collection("addresses").insertOne(newAddress);

      // If this address is set as default, update other addresses
      if ((address.isDefault || isFirst) && !isFirst) {
        await db.collection("addresses").updateMany(
          { 
            userId: new ObjectId(user?.id),
            _id: { $ne: result.insertedId }
          },
          { $set: { isDefault: false } }
        );
      }

      // Update addresses in state
      await fetchAddresses();
      
      return { 
        data: {
          id: result.insertedId.toString(),
          ...newAddress,
          userId: user?.id
        }, 
        error: null 
      };
    } catch (error) {
      console.error("Error adding address:", error);
      return { data: null, error };
    }
  };

  const updateAddress = async (address: AddressType) => {
    try {
      const { db } = await connectToDatabase();
      
      const { id, userId, createdAt, ...updateData } = address;
      
      await db.collection("addresses").updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      // If setting this address as default, update other addresses
      if (updateData.isDefault) {
        await db.collection("addresses").updateMany(
          { 
            userId: new ObjectId(user?.id),
            _id: { $ne: new ObjectId(id) }
          },
          { $set: { isDefault: false } }
        );
      }

      // Update addresses in state
      await fetchAddresses();
      
      return { data: address, error: null };
    } catch (error) {
      console.error("Error updating address:", error);
      return { data: null, error };
    }
  };

  const deleteAddress = async (addressId: string): Promise<void> => {
    try {
      const { db } = await connectToDatabase();
      
      // Check if the address is the default one
      const address = addresses?.find(addr => addr.id === addressId);
      const wasDefault = address?.isDefault;
      
      // Delete the address
      await db.collection("addresses").deleteOne({
        _id: new ObjectId(addressId)
      });

      // If the deleted address was the default, set another address as default
      if (wasDefault && addresses && addresses.length > 1) {
        const nextAddress = addresses.find(addr => addr.id !== addressId);
        if (nextAddress) {
          await db.collection("addresses").updateOne(
            { _id: new ObjectId(nextAddress.id) },
            { $set: { isDefault: true } }
          );
        }
      }

      // Update addresses in state
      await fetchAddresses();
      
      toast({
        title: "Endereço removido",
        description: "O endereço foi removido com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting address:", error);
      toast({
        title: "Erro ao remover endereço",
        description: "Não foi possível remover o endereço.",
        variant: "destructive",
      });
    }
  };

  const fetchNotifications = async (): Promise<void> => {
    try {
      if (!user?.id) {
        console.log("Cannot fetch notifications: No user ID");
        setNotifications([]);
        return;
      }
      
      console.log("Fetching notifications for user:", user.id);
      
      const { db } = await connectToDatabase();
      
      const notificationsData = await db.collection("notifications")
        .find({ userId: new ObjectId(user.id) })
        .sort({ createdAt: -1 })
        .toArray();

      console.log("Notifications data:", notificationsData);
      
      const formattedNotifications = notificationsData.map((notification: any) => ({
        id: notification._id.toString(),
        userId: notification.userId.toString(),
        tipo: notification.tipo,
        titulo: notification.titulo,
        mensagem: notification.mensagem,
        idRelacionado: notification.idRelacionado,
        lida: notification.lida,
        createdAt: notification.createdAt
      }));

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error("Exception fetching notifications:", error);
      setNotifications([]);
    }
  };

  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    try {
      console.log("Marking notification as read:", notificationId);
      
      const { db } = await connectToDatabase();
      
      await db.collection("notifications").updateOne(
        { _id: new ObjectId(notificationId) },
        { $set: { lida: true } }
      );

      console.log("Notification marked as read successfully");
      
      // Update notifications in state
      setNotifications(
        notifications?.map((notification) =>
          notification.id === notificationId ? { ...notification, lida: true } : notification
        ) || null
      );
    } catch (error) {
      console.error("Exception marking notification as read:", error);
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
    login,
    signup,
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
