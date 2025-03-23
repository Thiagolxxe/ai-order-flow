
// Tipo para mensagens
export type Message = {
  id: string;
  sender: 'user' | 'restaurant' | 'delivery' | 'system';
  text: string;
  timestamp: Date;
  read: boolean;
};

// Tipo para conversas
export type Conversation = {
  id: string;
  name: string;
  role: 'restaurant' | 'delivery';
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unread: number;
  orderId?: string;
};

// Tipo para o registro de mensagens
export type MessageRecord = Record<string, Message[]>;
