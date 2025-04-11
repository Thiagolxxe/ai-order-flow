
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NotificationItem, { NotificationType } from '@/components/notifications/NotificationType';
import { apiService } from '@/services/apiService';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import { Notification } from '@/services/api/types';

const Notifications = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const { data, error } = await apiService.notifications.getByUserId();
        
        if (error) {
          throw new Error(error.message);
        }
        
        // Cast data to Notification[] before sorting
        const notificationsData = data as Notification[];
        
        // Sort notifications by date (newest first)
        const sortedNotifications = notificationsData.sort((a, b) => {
          return new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime();
        });
        
        // Convert to NotificationType[] by ensuring criado_em is a Date
        const typedNotifications: NotificationType[] = sortedNotifications.map(notification => ({
          ...notification,
          criado_em: new Date(notification.criado_em)
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
          notif._id === notificationId 
            ? { ...notif, lida: true } 
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
        _id: '1',
        titulo: 'Seu pedido foi confirmado!',
        mensagem: 'O restaurante confirmou seu pedido #12345 e já está preparando.',
        tipo: 'success',
        lida: false,
        usuario_id: userId,
        criado_em: new Date(Date.now() - 15 * 60000) // 15 minutes ago
      },
      {
        _id: '2',
        titulo: 'Entregador a caminho',
        mensagem: 'João está a caminho para entregar seu pedido.',
        tipo: 'info',
        lida: true,
        usuario_id: userId,
        criado_em: new Date(Date.now() - 2 * 60 * 60000) // 2 hours ago
      },
      {
        _id: '3',
        titulo: 'Novo cupom disponível!',
        mensagem: 'Use o código BEMVINDO20 para obter 20% de desconto em seu próximo pedido.',
        tipo: 'info',
        lida: false,
        usuario_id: userId,
        criado_em: new Date(Date.now() - 24 * 60 * 60000) // 24 hours ago
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
                  key={notification._id} 
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
