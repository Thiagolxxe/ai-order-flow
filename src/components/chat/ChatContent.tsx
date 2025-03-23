
import React from 'react';
import { Conversation, Message } from './types';
import { Card, CardContent } from '@/components/ui/card';
import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import MessageInput from './MessageInput';
import EmptyChatState from './EmptyChatState';

interface ChatContentProps {
  activeConversation: string | null;
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  onSendMessage: (message: string) => void;
}

const ChatContent = ({ 
  activeConversation, 
  conversations,
  messages,
  onSendMessage
}: ChatContentProps) => {
  const activeChat = activeConversation 
    ? conversations.find(c => c.id === activeConversation) 
    : undefined;
  
  return (
    <Card className="md:col-span-2">
      <CardContent className="p-0 h-[600px] flex flex-col" aria-describedby="chat-content-description">
        <span id="chat-content-description" className="sr-only">
          Área de conversa de chat, contendo cabeçalho, mensagens e campo para envio de novas mensagens
        </span>
        {activeConversation ? (
          <>
            <ChatHeader conversation={activeChat} />
            <MessagesList messages={messages[activeConversation] || []} />
            <MessageInput onSendMessage={onSendMessage} />
          </>
        ) : (
          <EmptyChatState />
        )}
      </CardContent>
    </Card>
  );
};

export default ChatContent;
