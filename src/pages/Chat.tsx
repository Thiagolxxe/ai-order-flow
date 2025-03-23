
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ContactsList from '@/components/chat/ContactsList';
import ChatContent from '@/components/chat/ChatContent';
import { Conversation, Message, MessageRecord } from '@/components/chat/types';

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
  const [messages, setMessages] = useState<MessageRecord>({
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

  const handleSendMessage = (newMessage: string) => {
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
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Mensagens</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ContactsList 
          conversations={conversations}
          activeConversation={activeConversation}
          messages={messages}
          setMessages={setMessages}
          setConversations={setConversations}
          setActiveConversation={setActiveConversation}
        />
        
        <ChatContent 
          activeConversation={activeConversation}
          conversations={conversations}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default Chat;
