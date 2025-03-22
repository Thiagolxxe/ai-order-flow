
import React from 'react';
import { useUser } from '@/context/UserContext';
import type NotificationType from "@/components/notifications/NotificationType";

const Notifications = () => {
  const { notifications, markNotificationAsRead } = useUser();
  
  if (!notifications) {
    return <div>Carregando notificações...</div>;
  }

  return (
    <div>
      <h1>Notificações</h1>
      {notifications.length === 0 ? (
        <div>Nenhuma notificação encontrada.</div>
      ) : (
        <ul>
          {notifications.map((notification: NotificationType) => (
            <li key={notification.id}>
              <div>
                {notification.mensagem}
                {!notification.lida && (
                  <button onClick={() => markNotificationAsRead(notification.id)}>
                    Marcar como lida
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
