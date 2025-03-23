
import React from 'react';
import { Conversation } from './types';
import { UserIcon, RestaurantIcon, DeliveryIcon } from '@/assets/icons';

interface ChatContactProps {
  conversation: Conversation;
  active: boolean;
  onClick: () => void;
}

const ChatContact = ({ conversation, active, onClick }: ChatContactProps) => {
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

export default ChatContact;
