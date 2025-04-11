
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NotificationItem, { NotificationType } from '@/components/notifications/NotificationType';
import { apiService } from '@/services/apiService';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import { Notification, PaginatedResponse } from '@/services/api/types';

const Notifications = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const { data, error } = await apiService.notifications.getByUserId(user.id);
        
        if (error) {
          throw new Error(error.message);
        }
        
        // Cast data to appropriate type and extract notifications array
        let notificationsArray: Notification[] = [];
        
        if (data) {
          // Handle both PaginatedResponse and direct array return types
          if ('items' in (data as PaginatedResponse<Notification>)) {
            notificationsArray = (data as PaginatedResponse<Notification>).items;
          } else if (Array.isArray(data)) {
            notificationsArray = data as Notification[];
          }
        }
        
        // Sort notifications by date (newest first)
        const sortedNotifications = notificationsArray.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.criado_em || 0);
          const dateB = new Date(b.createdAt || b.criado_em || 0);
          return dateB.getTime() - dateA.getTime();
        });
        
        // Convert to NotificationType[]
        const typedNotifications: NotificationType[] = sortedNotifications.map(notification => ({
          ...notification,
          id: notification.id || notification._id || `temp-${Math.random()}`,
          createdAt: notification.createdAt instanceof Date ? 
            notification.createdAt : 
            new Date(notification.createdAt || notification.criado_em || Date.now())
        }));
        
        setNotifications(typedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Erro ao buscar notificações');
        // If we can't fetch from the API, use mock data
        setNotifications(getMockNotifications(user.id));
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { success, error } = await apiService.notifications.markAsRead(notificationId);
      
      if (!success && error) {
        // Fix type error by safely extracting message from error
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? String(error.message) 
          : 'Erro desconhecido';
          
        throw new Error(errorMessage);
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          (notif.id === notificationId || notif._id === notificationId)
            ? { ...notif, read: true, lida: true } 
            : notif
        )
      );
      
      toast.success('Notificação marcada como lida');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Erro ao marcar notificação como lida');
    }
  };

  // For demo purposes when API isn't available
  const getMockNotifications = (userId: string): NotificationType[] => {
    return [
      {
        id: '1',
        _id: '1',
        title: 'Seu pedido foi confirmado!',
        titulo: 'Seu pedido foi confirmado!',
        message: 'O restaurante confirmou seu pedido #12345 e já está preparando.',
        mensagem: 'O restaurante confirmou seu pedido #12345 e já está preparando.',
        type: 'success',
        tipo: 'success',
        read: false,
        lida: false,
        userId: userId,
        usuario_id: userId,
        createdAt: new Date(Date.now() - 15 * 60000) // 15 minutes ago
      },
      {
        id: '2',
        _id: '2',
        title: 'Entregador a caminho',
        titulo: 'Entregador a caminho',
        message: 'João está a caminho para entregar seu pedido.',
        mensagem: 'João está a caminho para entregar seu pedido.',
        type: 'info',
        tipo: 'info',
        read: true,
        lida: true,
        userId: userId,
        usuario_id: userId,
        createdAt: new Date(Date.now() - 2 * 60 * 60000) // 2 hours ago
      },
      {
        id: '3',
        _id: '3',
        title: 'Novo cupom disponível!',
        titulo: 'Novo cupom disponível!',
        message: 'Use o código BEMVINDO20 para obter 20% de desconto em seu próximo pedido.',
        mensagem: 'Use o código BEMVINDO20 para obter 20% de desconto em seu próximo pedido.',
        type: 'info',
        tipo: 'info',
        read: false,
        lida: false,
        userId: userId,
        usuario_id: userId,
        createdAt: new Date(Date.now() - 24 * 60 * 60000) // 24 hours ago
      }
    ];
  };

  return (
    <div className="container py-8 px-4 max-w-3xl mx-auto">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center space-y-0 gap-2 border-b pb-4">
          <Bell className="h-5 w-5" aria-hidden="true" />
          <CardTitle>Notificações</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          {loading ? (
            <div className="flex justify-center items-center h-40" aria-label="Carregando notificações">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem 
                  key={notification.id || notification._id} 
                  notification={notification} 
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8" aria-label="Nenhuma notificação">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-lg font-medium text-gray-900">Nenhuma notificação</h3>
              <p className="text-gray-500">Você não tem notificações para visualizar no momento.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
