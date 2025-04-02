
export interface NotificationType {
  id: string;
  usuario_id: string;
  id_relacionado?: string;
  lida: boolean;
  criado_em: string;
  titulo: string;
  mensagem: string;
  tipo: string;
}

export default function NotificationItem({ notification }: { notification: NotificationType }) {
  // Your notification item implementation
  return (
    <div className="p-4 border-b">
      <h3 className="font-medium">{notification.titulo}</h3>
      <p className="text-sm text-gray-500">{notification.mensagem}</p>
    </div>
  );
}
