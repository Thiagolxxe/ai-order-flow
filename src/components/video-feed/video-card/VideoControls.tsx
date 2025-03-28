
import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoControlsProps {
  muted: boolean;
  onMuteToggle: () => void;
}

const VideoControlsButton = ({ muted, onMuteToggle }: VideoControlsProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute bottom-4 right-4 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white w-12 h-12 hover:scale-110 transition-all z-20"
      onClick={onMuteToggle}
    >
      {muted ? <VolumeX size={26} /> : <Volume2 size={26} />}
      <span className="sr-only">{muted ? 'Ativar som' : 'Desativar som'}</span>
    </Button>
  );
};

export default VideoControlsButton;
