
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bell, Package, ThumbsUp, AlertTriangle } from 'lucide-react';

export interface NotificationType {
  _id: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  lida: boolean;
  usuario_id: string; 
  criado_em: Date;
}

interface NotificationProps {
  notification: NotificationType;
  onMarkAsRead?: (id: string) => void;
}

const NotificationItem: React.FC<NotificationProps> = ({ notification, onMarkAsRead }) => {
  const handleMarkAsRead = () => {
    if (onMarkAsRead && !notification.lida) {
      onMarkAsRead(notification._id);
    }
  };

  const getIcon = () => {
    switch (notification.tipo) {
      case 'success':
        return <ThumbsUp className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const formattedDate = notification.criado_em 
    ? format(new Date(notification.criado_em), "d 'de' MMMM', às' HH:mm", { locale: ptBR })
    : '';

  return (
    <div 
      className={`p-4 border-b last:border-b-0 cursor-pointer ${notification.lida ? 'bg-gray-50' : 'bg-white'}`}
      onClick={handleMarkAsRead}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className={`text-sm font-medium ${notification.lida ? 'text-gray-600' : 'text-gray-900'}`}>
            {notification.titulo}
          </h4>
          <p className="text-sm text-gray-500 mt-1">{notification.mensagem}</p>
          <p className="text-xs text-gray-400 mt-2">{formattedDate}</p>
        </div>
        {!notification.lida && (
          <div className="ml-3 flex-shrink-0">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
