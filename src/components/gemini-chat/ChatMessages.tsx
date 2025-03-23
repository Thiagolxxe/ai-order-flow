
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '@/hooks/useGeminiAI';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messages.length === 0 && !isLoading) return;
    
    // Schedule the scroll with a larger delay to ensure rendering is complete
    const timeoutId = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        console.log('Scrolling to bottom in GeminiChatMessages');
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);
  
  // Render message content with formatting
  const renderMessageContent = (content: string) => {
    // Basic markdown formatting
    return content
      .split('\n')
      .map((line, i) => {
        // Bold text
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic text
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        return line ? <p key={i} dangerouslySetInnerHTML={{ __html: line }} /> : <br key={i} />;
      });
  };

  return (
    <ScrollArea 
      ref={scrollAreaRef}
      className="flex-1 p-4 h-[calc(100%-80px)]" 
      type="always"
      style={{ 
        scrollbarGutter: 'stable',
        scrollbarWidth: 'thin'
      }}
      viewportRef={scrollAreaRef}
    >
      <div className="flex flex-col">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`mb-4 max-w-[80%] ${
              message.role === 'user' 
                ? 'ml-auto bg-primary text-primary-foreground' 
                : 'mr-auto bg-muted'
            } rounded-lg p-3`}
          >
            <div className="text-sm">
              {renderMessageContent(message.content)}
            </div>
            <p className="text-xs mt-1 opacity-70 text-right">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))}
        {isLoading && (
          <div className="mr-auto bg-muted rounded-lg p-3 mb-4 max-w-[80%]">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-75"></div>
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-150"></div>
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-300"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
