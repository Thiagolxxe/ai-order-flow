
import React from 'react';
import { Message } from './types';

interface ChatMessageProps {
  message: Message;
  isUser: boolean;
}

const ChatMessage = ({ message, isUser }: ChatMessageProps) => {
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

export default ChatMessage;
