
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '@/hooks/useGeminiAI';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current && viewportRef.current) {
      // Use requestAnimationFrame to ensure DOM updates are complete
      requestAnimationFrame(() => {
        // Force scroll to the end
        if (viewportRef.current) {
          viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
          
          console.log('Forcing scroll to the end', {
            scrollHeight: viewportRef.current.scrollHeight,
            clientHeight: viewportRef.current.clientHeight,
            scrollTop: viewportRef.current.scrollTop
          });
        }
        
        // Use scrollIntoView as a backup
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
      });
    }
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
      className="flex-1 p-4 h-[calc(100%-80px)] overflow-y-auto" 
      viewportRef={viewportRef}
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
        <div ref={messagesEndRef} className="h-4" />
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
