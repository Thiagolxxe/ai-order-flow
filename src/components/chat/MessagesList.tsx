
import React, { useRef, useEffect } from 'react';
import { Message } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from './ChatMessage';

interface MessagesListProps {
  messages: Message[];
}

const MessagesList = ({ messages }: MessagesListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Scroll to the last message when messages change
  useEffect(() => {
    console.log('Messages changed, attempting to scroll to bottom');
    console.log('Messages count:', messages.length);
    
    if (messagesEndRef.current && viewportRef.current) {
      console.log('messagesEndRef and viewportRef exist, scrolling to bottom');
      
      // Method 1: Using scrollIntoView on the last message
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      
      // Method 2: Using scrollTop direct manipulation on viewport
      setTimeout(() => {
        if (viewportRef.current) {
          viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
          console.log('Set viewportRef scrollTop to:', viewportRef.current.scrollHeight);
        }
      }, 100);
      
      // Method 3: Using Element.scrollTo API
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        if (viewportRef.current) {
          viewportRef.current.scrollTo({
            top: viewportRef.current.scrollHeight,
            behavior: 'smooth'
          });
          console.log('Used scrollTo API to scroll to bottom');
        }
      }, 200);
    } else {
      console.log('messagesEndRef or viewportRef is null, cannot scroll');
      console.log('messagesEndRef exists:', !!messagesEndRef.current);
      console.log('viewportRef exists:', !!viewportRef.current);
    }
  }, [messages]);

  return (
    <ScrollArea 
      className="flex-1 py-4 px-4 overflow-y-auto" 
      aria-label="Mensagens da conversa"
      viewportRef={viewportRef}
    >
      <div className="space-y-2">
        {messages.map(message => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            isUser={message.sender === 'user'} 
          />
        ))}
        <div ref={messagesEndRef} style={{ height: '1px', marginTop: '10px' }} />
      </div>
    </ScrollArea>
  );
};

export default MessagesList;
