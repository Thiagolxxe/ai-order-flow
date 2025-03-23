
import React from 'react';
import { Conversation } from './types';
import { RestaurantIcon, DeliveryIcon, BagIcon } from '@/assets/icons';

interface ChatHeaderProps {
  conversation: Conversation | undefined;
}

const ChatHeader = ({ conversation }: ChatHeaderProps) => {
  if (!conversation) return null;
  
  return (
    <div className="p-4 border-b bg-card flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        {conversation.role === 'restaurant' ? (
          <RestaurantIcon className="w-5 h-5" />
        ) : (
          <DeliveryIcon className="w-5 h-5" />
        )}
      </div>
      <div>
        <h3 className="font-medium">{conversation.name}</h3>
        {conversation.orderId && (
          <div className="flex items-center text-xs text-muted-foreground">
            <BagIcon className="w-3 h-3 mr-1" />
            Pedido #{conversation.orderId}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
