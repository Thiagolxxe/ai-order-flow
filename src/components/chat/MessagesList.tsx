
import React, { useRef, useEffect } from 'react';
import { Message } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from './ChatMessage';

interface MessagesListProps {
  messages: Message[];
}

const MessagesList = ({ messages }: MessagesListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the last message when messages change
  useEffect(() => {
    console.log('Messages changed, attempting to scroll to bottom');
    console.log('Messages count:', messages.length);
    
    if (messagesEndRef.current) {
      console.log('messagesEndRef exists, scrolling into view');
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      
      // Add a fallback manual scroll in case ScrollArea is interfering
      const scrollAreaElement = document.querySelector('[role="presentation"] > [data-radix-scroll-area-viewport]');
      if (scrollAreaElement) {
        console.log('Found ScrollArea viewport, setting scrollTop manually');
        setTimeout(() => {
          scrollAreaElement.scrollTop = scrollAreaElement.scrollHeight;
          console.log('ScrollArea scrollTop set to:', scrollAreaElement.scrollHeight);
        }, 100);
      } else {
        console.log('Could not find ScrollArea viewport element');
      }
    } else {
      console.log('messagesEndRef is null, cannot scroll');
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 py-4 px-4 overflow-y-auto" aria-label="Mensagens da conversa">
      <div className="space-y-2">
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
