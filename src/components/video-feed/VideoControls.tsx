
import React from 'react';
import { ChevronUp, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Video {
  id: string;
  restaurantId: string;
  restaurantName: string;
  dishName: string;
  price: number;
  videoUrl: string;
  likes: number;
  description: string;
}

interface VideoControlsProps {
  video: Video;
  onNext: () => void;
  onPrevious: () => void;
  onMuteToggle: () => void;
  muted: boolean;
}

const VideoControls = ({ video, onNext, onPrevious, onMuteToggle, muted }: VideoControlsProps) => {
  return (
    <div className="fixed left-4 bottom-1/2 transform translate-y-1/2 flex flex-col items-center space-y-4 z-10">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white w-10 h-10 transition-all hover:scale-110"
        onClick={onPrevious}
      >
        <ChevronUp size={24} />
        <span className="sr-only">Vídeo anterior</span>
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white w-10 h-10 transition-all hover:scale-110"
        onClick={onNext}
      >
        <ChevronDown size={24} />
        <span className="sr-only">Próximo vídeo</span>
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white w-10 h-10 mt-4 transition-all hover:scale-110"
        onClick={onMuteToggle}
      >
        {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        <span className="sr-only">{muted ? 'Ativar som' : 'Desativar som'}</span>
      </Button>
    </div>
  );
};

export default VideoControls;
