
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Expandindo os tipos de papéis de usuário
export type UserRole = 'customer' | 'restaurant' | 'delivery' | 'admin' | 'guest';

// Adicionando tipos para notificações, favoritos e endereços
export interface Notification {
  id: string;
  type: 'order' | 'promo' | 'system';
  title: string;
  message: string;
  read: boolean;
  date: string;
}

export interface Favorite {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
}

export interface Address {
  id: string;
  label: string;
  endereco: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  isDefault: boolean;
}

export interface UserContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  notifications: Notification[];
  favorites: Favorite[];
  addresses: Address[];
  addNotification: (notification: Omit<Notification, 'id' | 'date'>) => void;
  markNotificationAsRead: (id: string) => void;
  toggleFavorite: (restaurant: { id: string, name: string, image: string }) => void;
  isFavorite: (restaurantId: string) => boolean;
  user: { id: string } | null;
  setUser: (user: { id: string } | null) => void;
  addAddress: (address: Omit<Address, 'id' | 'isDefault'>) => void;
  removeAddress: (id: string) => void;
  updateAddress: (id: string, address: Partial<Omit<Address, 'id'>>) => void;
  setDefaultAddress: (id: string) => void;
  getDefaultAddress: () => Address | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [user, setUser] = useState<{ id: string } | null>(null);

  // Função para adicionar notificação
  const addNotification = (notification: Omit<Notification, 'id' | 'date'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Função para marcar notificação como lida
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Funções para favoritos
  const toggleFavorite = (restaurant: { id: string, name: string, image: string }) => {
    const isFav = favorites.some(fav => fav.restaurantId === restaurant.id);
    
    if (isFav) {
      setFavorites(prev => prev.filter(fav => fav.restaurantId !== restaurant.id));
    } else {
      const newFavorite: Favorite = {
        id: Math.random().toString(36).substring(7),
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantImage: restaurant.image
      };
      setFavorites(prev => [...prev, newFavorite]);
    }
  };

  const isFavorite = (restaurantId: string) => {
    return favorites.some(fav => fav.restaurantId === restaurantId);
  };

  // Funções para endereços
  const addAddress = (address: Omit<Address, 'id' | 'isDefault'>) => {
    const newAddress: Address = {
      ...address,
      id: Math.random().toString(36).substring(7),
      isDefault: addresses.length === 0 // Primeiro endereço é o padrão
    };
    
    setAddresses(prev => [...prev, newAddress]);
    return newAddress;
  };

  const removeAddress = (id: string) => {
    const addressToRemove = addresses.find(addr => addr.id === id);
    
    setAddresses(prev => {
      const filtered = prev.filter(addr => addr.id !== id);
      
      // Se o endereço removido era o padrão, defina um novo padrão
      if (addressToRemove?.isDefault && filtered.length > 0) {
        return filtered.map((addr, index) => 
          index === 0 ? { ...addr, isDefault: true } : addr
        );
      }
      
      return filtered;
    });
  };

  const updateAddress = (id: string, addressUpdate: Partial<Omit<Address, 'id'>>) => {
    setAddresses(prev => 
      prev.map(addr => addr.id === id ? { ...addr, ...addressUpdate } : addr)
    );
  };

  const setDefaultAddress = (id: string) => {
    setAddresses(prev => 
      prev.map(addr => ({ ...addr, isDefault: addr.id === id }))
    );
  };

  const getDefaultAddress = (): Address | undefined => {
    return addresses.find(addr => addr.isDefault);
  };

  return (
    <UserContext.Provider 
      value={{ 
        userRole, 
        setUserRole, 
        isAuthenticated, 
        setIsAuthenticated,
        notifications,
        favorites,
        addresses,
        addNotification,
        markNotificationAsRead,
        toggleFavorite,
        isFavorite,
        user,
        setUser,
        addAddress,
        removeAddress,
        updateAddress,
        setDefaultAddress,
        getDefaultAddress
      }}
    >
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
