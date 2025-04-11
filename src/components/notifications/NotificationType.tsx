
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, Bell, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { Notification as NotificationApiType } from '@/services/api/types';

// Export NotificationType interface to make it accessible for other components
export interface NotificationType extends Omit<NotificationApiType, 'criado_em'> {
  criado_em: Date;
}

interface NotificationItemProps {
  notification: NotificationType;
  onMarkAsRead: (id: string) => void;
}

const getIconByType = (type: string) => {
  switch (type) {
    case 'success':
      return <Check className="h-5 w-5 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'info':
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const timeAgo = formatDistanceToNow(new Date(notification.criado_em), {
    addSuffix: true,
    locale: ptBR,
  });

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'destructive';
      case 'info':
      default:
        return 'default';
    }
  };

  return (
    <div className="py-4 flex flex-col sm:flex-row items-start gap-3 group hover:bg-muted/50 p-3 rounded-md transition-colors">
      <div className="flex-shrink-0 mt-1">
        {getIconByType(notification.tipo)}
      </div>
      
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
          <h4 className="font-medium text-base">{notification.titulo}</h4>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        
        <p className="text-sm text-muted-foreground mb-2">{notification.mensagem}</p>
        
        <div className="flex items-center justify-between mt-1">
          <Badge variant={getBadgeVariant(notification.tipo) as any} className="text-xs">
            {notification.tipo}
          </Badge>
          
          {!notification.lida && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs flex items-center gap-1 h-7"
              onClick={() => onMarkAsRead(notification._id)}
            >
              <Check className="h-3.5 w-3.5" />
              Marcar como lida
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
