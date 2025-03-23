
import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChatIcon, 
  SendIcon,
  UserIcon, 
  DeliveryIcon, 
  RestaurantIcon,
  BagIcon
} from '@/assets/icons';
import { ScrollArea } from '@/components/ui/scroll-area';

// Tipo para mensagens
type Message = {
  id: string;
  sender: 'user' | 'restaurant' | 'delivery' | 'system';
  text: string;
  timestamp: Date;
  read: boolean;
};

// Tipo para conversas
type Conversation = {
  id: string;
  name: string;
  role: 'restaurant' | 'delivery';
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unread: number;
  orderId?: string;
};

// Componente de mensagem
const ChatMessage = ({ message, isUser }: { message: Message, isUser: boolean }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[75%] ${
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted text-foreground'
        } rounded-lg px-3 py-2`}
      >
        <p className="text-sm">{message.text}</p>
        <p className="text-xs opacity-70 mt-1 text-right">
          {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </p>
      </div>
    </div>
  );
};

// Componente de contato de chat
const ChatContact = ({ 
  conversation,
  active,
  onClick
}: { 
  conversation: Conversation,
  active: boolean,
  onClick: () => void
}) => {
  const getIcon = () => {
    switch (conversation.role) {
      case 'restaurant':
        return <RestaurantIcon className="w-5 h-5" />;
      case 'delivery':
        return <DeliveryIcon className="w-5 h-5" />;
      default:
        return <UserIcon className="w-5 h-5" />;
    }
  };

  return (
    <div 
      className={`flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-muted/50 ${
        active ? 'bg-muted' : ''
      }`}
      onClick={onClick}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        active ? 'bg-primary text-primary-foreground' : 'bg-muted'
      }`}>
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <h3 className="font-medium truncate">{conversation.name}</h3>
          {conversation.lastMessageTime && (
            <span className="text-xs text-muted-foreground">
              {conversation.lastMessageTime.toLocaleDateString([], {
                day: '2-digit',
                month: '2-digit'
              })}
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          {conversation.lastMessage && (
            <p className="text-sm text-muted-foreground truncate">
              {conversation.lastMessage}
            </p>
          )}
          
          {conversation.unread > 0 && (
            <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {conversation.unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const Chat = () => {
  const { id } = useParams<{ id?: string }>();
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      name: 'Urban Burger Bistro',
      role: 'restaurant',
      lastMessage: 'Seu pedido está sendo preparado',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
      unread: 0,
      orderId: '41293'
    },
    {
      id: '2',
      name: 'Carlos Oliveira',
      role: 'delivery',
      lastMessage: 'Estou a caminho do seu endereço',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 5), // 5 minutos atrás
      unread: 2,
      orderId: '41293'
    }
  ]);
  
  const [activeConversation, setActiveConversation] = useState<string | null>(id || null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    '1': [
      {
        id: '1',
        sender: 'system',
        text: 'Conversa iniciada para o pedido #41293',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hora atrás
        read: true
      },
      {
        id: '2',
        sender: 'restaurant',
        text: 'Olá! Seu pedido foi recebido e está sendo preparado.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
        read: true
      }
    ],
    '2': [
      {
        id: '1',
        sender: 'system',
        text: 'Conversa iniciada para o pedido #41293',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutos atrás
        read: true
      },
      {
        id: '2',
        sender: 'delivery',
        text: 'Olá! Sou o Carlos, seu entregador. Acabei de pegar seu pedido no restaurante.',
        timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutos atrás
        read: true
      },
      {
        id: '3',
        sender: 'delivery',
        text: 'Estou a caminho do seu endereço. Devo chegar em aproximadamente 15 minutos.',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutos atrás
        read: false
      },
      {
        id: '4',
        sender: 'delivery',
        text: 'Estou na portaria do seu prédio. Pode confirmar seu apartamento?',
        timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutos atrás
        read: false
      }
    ]
  });
  
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Rolar para a última mensagem quando as mensagens mudarem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConversation]);

  // Definir conversa ativa com base no ID da URL
  useEffect(() => {
    if (id) {
      setActiveConversation(id);
      
      // Marcar mensagens como lidas
      if (id && messages[id]) {
        setMessages(prevMessages => ({
          ...prevMessages,
          [id]: prevMessages[id].map(msg => ({ ...msg, read: true }))
        }));
        
        // Atualizar contagem de não lidas na conversa
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === id ? { ...conv, unread: 0 } : conv
          )
        );
      }
    }
  }, [id]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    // Adicionar nova mensagem
    const newMsg: Message = {
      id: Math.random().toString(36).substring(7),
      sender: 'user',
      text: newMessage,
      timestamp: new Date(),
      read: true
    };
    
    setMessages(prevMessages => ({
      ...prevMessages,
      [activeConversation]: [...(prevMessages[activeConversation] || []), newMsg]
    }));
    
    // Atualizar conversa com última mensagem
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === activeConversation 
          ? { 
              ...conv, 
              lastMessage: newMessage, 
              lastMessageTime: new Date() 
            } 
          : conv
      )
    );
    
    // Simular resposta automática após 1 segundo
    setTimeout(() => {
      const autoResponse: Message = {
        id: Math.random().toString(36).substring(7),
        sender: conversations.find(c => c.id === activeConversation)?.role || 'system',
        text: `Mensagem de demonstração automática em resposta a: "${newMessage}"`,
        timestamp: new Date(),
        read: true
      };
      
      setMessages(prevMessages => ({
        ...prevMessages,
        [activeConversation]: [...(prevMessages[activeConversation] || []), autoResponse]
      }));
    }, 1000);
    
    setNewMessage('');
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Mensagens</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de conversas */}
        <Card className="md:col-span-1">
          <CardContent className="p-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-1">
                {conversations.map(conversation => (
                  <ChatContact 
                    key={conversation.id}
                    conversation={conversation}
                    active={activeConversation === conversation.id}
                    onClick={() => {
                      setActiveConversation(conversation.id);
                      
                      // Marcar mensagens como lidas
                      if (messages[conversation.id]) {
                        setMessages(prevMessages => ({
                          ...prevMessages,
                          [conversation.id]: prevMessages[conversation.id].map(msg => ({ ...msg, read: true }))
                        }));
                        
                        // Atualizar contagem de não lidas
                        setConversations(prevConversations => 
                          prevConversations.map(conv => 
                            conv.id === conversation.id ? { ...conv, unread: 0 } : conv
                          )
                        );
                      }
                    }}
                  />
                ))}
                
                {conversations.length === 0 && (
                  <div className="text-center py-10">
                    <ChatIcon className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      Nenhuma conversa iniciada
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Área de chat */}
        <Card className="md:col-span-2">
          <CardContent className="p-0 h-[600px] flex flex-col">
            {activeConversation ? (
              <>
                {/* Cabeçalho do chat */}
                <div className="p-4 border-b bg-card flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {conversations.find(c => c.id === activeConversation)?.role === 'restaurant' ? (
                      <RestaurantIcon className="w-5 h-5" />
                    ) : (
                      <DeliveryIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {conversations.find(c => c.id === activeConversation)?.name}
                    </h3>
                    {conversations.find(c => c.id === activeConversation)?.orderId && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <BagIcon className="w-3 h-3 mr-1" />
                        Pedido #{conversations.find(c => c.id === activeConversation)?.orderId}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Mensagens - usando ScrollArea para rolagem adequada */}
                <ScrollArea className="flex-1 py-4 px-4">
                  <div className="space-y-2">
                    {messages[activeConversation]?.map(message => (
                      <ChatMessage 
                        key={message.id} 
                        message={message} 
                        isUser={message.sender === 'user'} 
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                {/* Input de mensagem */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage}>
                      <SendIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-6">
                  <ChatIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma conversa selecionada</h3>
                  <p className="text-muted-foreground max-w-md">
                    Selecione uma conversa à esquerda ou inicie uma nova conversa a partir 
                    de um pedido.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;
