
import React, { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  className?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, className }) => {
  const [input, setInput] = useState('');

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    
    const message = input.trim();
    setInput(''); // Clear input immediately for better UX
    
    try {
      await onSendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore input if there was an error
      setInput(message);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`p-4 border-t bg-background shrink-0 ${className || ''}`}>
      <div className="flex space-x-2">
        <Input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? "Aguardando resposta..." : "Digite sua mensagem..."}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className="min-h-10"
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={isLoading || !input.trim()}
          aria-label="Enviar mensagem"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
