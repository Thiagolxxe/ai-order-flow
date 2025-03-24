
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Conversation } from './types';

export interface ChatHeaderProps {
  conversation?: Conversation;
  className?: string;
}

const ChatHeader = ({ conversation, className }: ChatHeaderProps) => {
  // Generate initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!conversation) return null;

  return (
    <div className={`flex items-center gap-3 p-4 border-b ${className || ''}`}>
      <Avatar className="h-10 w-10">
        {conversation.avatar ? (
          <AvatarImage src={conversation.avatar} alt={conversation.name} />
        ) : null}
        <AvatarFallback>{getInitials(conversation.name)}</AvatarFallback>
      </Avatar>
      <div>
        <h3 className="font-medium">{conversation.name}</h3>
        {conversation.orderId && (
          <p className="text-sm text-muted-foreground">
            Pedido #{conversation.orderId}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
