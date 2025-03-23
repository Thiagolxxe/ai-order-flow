
import React, { useRef, useEffect } from 'react';
import { Message } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from './ChatMessage';

interface MessagesListProps {
  messages: Message[];
}

const MessagesList = ({ messages }: MessagesListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the last message when messages change
  useEffect(() => {
    if (messages.length === 0) return;
    
    // Schedule the scroll with a delay to ensure rendering is complete
    const timeoutId = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        console.log('Scrolling to bottom in MessagesList');
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [messages]);

  return (
    <ScrollArea 
      className="flex-1" 
      aria-label="Mensagens da conversa"
      ref={scrollAreaRef}
      type="always"
      orientation="vertical"
      viewportRef={scrollAreaRef}
      style={{ 
        height: '450px',
        maxHeight: '450px',
        scrollbarGutter: 'stable',
        scrollbarWidth: 'thin',
        overflowY: 'auto'
      }}
    >
      <div className="space-y-2 py-4 px-4">
        {messages.map(message => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            isUser={message.sender === 'user'} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default MessagesList;
