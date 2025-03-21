
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BagIcon, 
  NotificationIcon, 
  SuccessIcon, 
  AlertIcon 
} from '@/assets/icons';
import { useUser, Notification } from '@/context/UserContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componente para um item de notificação
const NotificationItem = ({ 
  notification, 
  onMarkAsRead 
}: { 
  notification: Notification, 
  onMarkAsRead: (id: string) => void 
}) => {
  // Função para obter o ícone com base no tipo da notificação
  const getIcon = () => {
    switch (notification.type) {
      case 'order':
        return <BagIcon className="w-6 h-6 text-primary" />;
      case 'promo':
        return <NotificationIcon className="w-6 h-6 text-amber-500" />;
      case 'system':
        return <AlertIcon className="w-6 h-6 text-blue-500" />;
      default:
        return <NotificationIcon className="w-6 h-6 text-primary" />;
    }
  };

  // Obter o tempo relativo
  const getRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
    } catch (error) {
      return 'recentemente';
    }
  };

  return (
    <Card className={`mb-3 ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 p-2 rounded-full ${
            notification.read ? 'bg-muted' : 'bg-primary/10'
          }`}>
            {getIcon()}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h3 className={`font-semibold ${!notification.read ? 'text-foreground' : 'text-foreground/80'}`}>
                {notification.title}
              </h3>
              <span className="text-xs text-muted-foreground">
                {getRelativeTime(notification.date)}
              </span>
            </div>
            
            <p className={`text-sm mt-1 ${!notification.read ? 'text-foreground/90' : 'text-foreground/70'}`}>
              {notification.message}
            </p>
            
            <div className="flex justify-end mt-2">
              {!notification.read && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  Marcar como lida
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Página principal de notificações
const Notifications = () => {
  const { notifications, markNotificationAsRead } = useUser();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);

  // Inicializar com mockNotifications se ainda não tiver notificações do contexto
  useEffect(() => {
    if (notifications.length === 0) {
      setLocalNotifications(mockNotifications);
    } else {
      setLocalNotifications(notifications);
    }
  }, [notifications]);

  // Exemplo de notificações para demonstração
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'order',
      title: 'Seu pedido foi entregue!',
      message: 'Seu pedido #41293 foi entregue com sucesso. Aproveite sua refeição!',
      read: false,
      date: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutos atrás
    },
    {
      id: '2',
      type: 'promo',
      title: 'Oferta Especial!',
      message: 'Aproveite 20% de desconto em todo cardápio do Urban Burger Bistro hoje!',
      read: false,
      date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 horas atrás
    },
    {
      id: '3',
      type: 'system',
      title: 'Bem-vindo ao DeliverAI!',
      message: 'Obrigado por se cadastrar. Descubra os melhores restaurantes da sua região.',
      read: true,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
    },
    {
      id: '4',
      type: 'order',
      title: 'Pedido saiu para entrega',
      message: 'Seu pedido #41290 saiu para entrega e chegará em breve.',
      read: true,
      date: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // 1 dia e 1 hora atrás
    },
  ];
  
  // Filtrar notificações com base na aba ativa
  const filteredNotifications = activeTab === 'all' 
    ? localNotifications 
    : localNotifications.filter(n => !n.read);

  // Obter contagem de não lidas
  const unreadCount = localNotifications.filter(n => !n.read).length;

  // Marcar todas as notificações como lidas
  const markAllAsRead = () => {
    filteredNotifications.forEach(notification => {
      if (!notification.read) {
        markNotificationAsRead(notification.id);
      }
    });
    
    // Atualizar o estado local também
    setLocalNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };
  
  // Handler local para marcar como lida
  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
    
    // Atualizar o estado local também
    setLocalNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notificações</h1>
        
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            Marcar todas como lidas
          </Button>
        )}
      </div>
      
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveTab('all')}
        >
          Todas
        </Button>
        <Button
          variant={activeTab === 'unread' ? 'default' : 'outline'}
          onClick={() => setActiveTab('unread')}
        >
          Não lidas {unreadCount > 0 && `(${unreadCount})`}
        </Button>
      </div>
      
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <NotificationIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              {activeTab === 'all' ? 'Sem notificações' : 'Nenhuma notificação não lida'}
            </h3>
            <p className="text-muted-foreground">
              {activeTab === 'all' 
                ? 'Você não tem nenhuma notificação no momento.' 
                : 'Você não tem notificações não lidas.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Notifications;
