
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Expandindo os tipos de papéis de usuário
export type UserRole = 'customer' | 'restaurant' | 'delivery' | 'admin' | 'guest';

// Adicionando tipos para notificações e favoritos
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

export interface UserContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  notifications: Notification[];
  favorites: Favorite[];
  addNotification: (notification: Omit<Notification, 'id' | 'date'>) => void;
  markNotificationAsRead: (id: string) => void;
  toggleFavorite: (restaurant: { id: string, name: string, image: string }) => void;
  isFavorite: (restaurantId: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);

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

  return (
    <UserContext.Provider 
      value={{ 
        userRole, 
        setUserRole, 
        isAuthenticated, 
        setIsAuthenticated,
        notifications,
        favorites,
        addNotification,
        markNotificationAsRead,
        toggleFavorite,
        isFavorite
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
