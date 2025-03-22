
import React from 'react';
import { useUser } from '@/context/UserContext';
import type NotificationType from "@/components/notifications/NotificationType";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BellIcon, CheckCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const Notifications = () => {
  const { notifications, markNotificationAsRead, isLoading, isAuthenticated } = useUser();
  
  console.log("Notifications page:", { isLoading, isAuthenticated, notifications });
  
  if (isLoading) {
    return (
      <div className="container py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Notificações</h1>
        <div className="space-y-4">
          <div className="h-20 bg-gray-100 animate-pulse rounded-md"></div>
          <div className="h-20 bg-gray-100 animate-pulse rounded-md"></div>
          <div className="h-20 bg-gray-100 animate-pulse rounded-md"></div>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="container py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Notificações</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Faça login para visualizar suas notificações</h3>
            <p className="text-gray-500 mb-4">Você precisa estar logado para acessar suas notificações</p>
            <Button asChild>
              <a href="/login">Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Notificações</h1>
      
      {!notifications || notifications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">Nenhuma notificação encontrada</h3>
            <p className="text-gray-500">Você não tem notificações no momento.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification: NotificationType) => (
            <Card key={notification.id} className={notification.lida ? "bg-gray-50" : "border-l-4 border-l-primary"}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{notification.titulo || "Nova notificação"}</h3>
                    <p className="text-gray-700 mt-1">{notification.mensagem}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span>
                        {new Date(notification.criado_em).toLocaleDateString('pt-BR', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {notification.lida && (
                        <span className="flex items-center ml-3">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Lida
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {!notification.lida && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      Marcar como lida
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
