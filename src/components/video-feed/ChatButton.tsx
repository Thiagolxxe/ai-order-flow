
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface ChatButtonProps {
  onClick: () => void;
  disabled: boolean;
  errorState: string | null;
}

const ChatButton = ({ onClick, disabled, errorState }: ChatButtonProps) => {
  return (
    <div className="fixed right-4 bottom-24 flex flex-col items-center space-y-4 z-10">
      <Button
        size="icon"
        variant="outline"
        className="rounded-full bg-primary/80 hover:bg-primary text-white border-none w-12 h-12"
        onClick={onClick}
        disabled={disabled}
      >
        <MessageCircle size={24} />
      </Button>
      {errorState && (
        <span className="bg-black/80 text-white px-2 py-1 rounded text-xs">
          {errorState}
        </span>
      )}
    </div>
  );
};

export default ChatButton;
