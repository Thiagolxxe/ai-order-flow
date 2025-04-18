
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendIcon } from '@/assets/icons';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  className?: string;
}

const MessageInput = ({ onSendMessage, className }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <div className={`p-4 border-t bg-background ${className || ''}`}>
      <div className="flex gap-2" aria-describedby="message-input-description">
        <span id="message-input-description" className="sr-only">
          Campo para envio de mensagens na conversa
        </span>
        <Input
          placeholder="Digite sua mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
          aria-label="Mensagem"
        />
        <Button onClick={handleSend} aria-label="Enviar mensagem">
          <SendIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
