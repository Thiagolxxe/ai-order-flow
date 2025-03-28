
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
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

const VideoControls = ({ video, onNext, onPrevious }: VideoControlsProps) => {
  return (
    <div className="fixed left-4 top-1/3 transform -translate-y-1/2 flex flex-col items-center space-y-4 z-20">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white w-12 h-12 transition-all hover:scale-110"
        onClick={onPrevious}
      >
        <ChevronUp size={26} />
        <span className="sr-only">Vídeo anterior</span>
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white w-12 h-12 transition-all hover:scale-110"
        onClick={onNext}
      >
        <ChevronDown size={26} />
        <span className="sr-only">Próximo vídeo</span>
      </Button>
    </div>
  );
};

export default VideoControls;
