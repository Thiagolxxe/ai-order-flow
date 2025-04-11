
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { apiService } from '@/services/apiService';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { NotificationType } from './NotificationType';

const NotificationIndicator = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    // Only fetch notifications if user is logged in
    if (!user?.id) return;

    const fetchUnreadNotifications = async () => {
      try {
        setLoading(true);
        const { data, error } = await apiService.notifications.getUnread();
        
        if (error) {
          console.error('Error fetching unread notifications:', error);
          return;
        }
        
        // Ensure we have an array of notifications
        let notificationsData = Array.isArray(data) ? data : (data as any)?.notifications || [];
        
        if (!Array.isArray(notificationsData)) {
          console.warn('Notifications data is not an array:', notificationsData);
          notificationsData = [];
        }
        
        // Convert to NotificationType[] by ensuring criado_em is a Date
        const typedNotifications: NotificationType[] = notificationsData.map((notification: any) => ({
          ...notification,
          _id: notification._id || notification.id || `temp-${Math.random()}`,
          criado_em: notification.criado_em instanceof Date ? 
            notification.criado_em : new Date(notification.criado_em || Date.now())
        }));
        
        setUnreadCount(typedNotifications.length);
        setRecentNotifications(typedNotifications.slice(0, 3)); // Only show 3 most recent
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadNotifications();
    
    // Refresh unread count every 60 seconds
    const interval = setInterval(fetchUnreadNotifications, 60000);
    
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { success } = await apiService.notifications.markAsRead(notificationId);
      
      if (success) {
        setRecentNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, lida: true } 
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative" 
          aria-label={`Notificações ${unreadCount > 0 ? `, ${unreadCount} não lidas` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 min-w-[1.25rem] h-5 flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notificações</h3>
            <Link to="/notifications" className="text-xs text-primary hover:underline">
              Ver todas
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-6">
            <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full"></div>
          </div>
        ) : recentNotifications.length > 0 ? (
          <div className="max-h-[300px] overflow-y-auto">
            {recentNotifications.map(notification => (
              <div key={notification._id} className="p-3 border-b hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-2">
                  <p className="text-sm font-medium line-clamp-1">
                    {notification.titulo}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {notification.mensagem}
                </p>
                {!notification.lida && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 h-7 text-xs"
                    onClick={() => handleMarkAsRead(notification._id)}
                  >
                    Marcar como lida
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma notificação não lida
            </p>
          </div>
        )}
        
        <div className="p-3 border-t">
          <Link to="/notifications">
            <Button variant="outline" className="w-full" size="sm">
              Ver todas as notificações
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationIndicator;
