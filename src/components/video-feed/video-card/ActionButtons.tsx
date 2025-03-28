
import React from 'react';
import { Heart, Share2, Info, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Video } from '@/hooks/useVideoFeed';

interface ActionButtonsProps {
  video: Video;
  isLiked: boolean;
  onLike: () => void;
  onShare: () => void;
  onComment: () => void;
  onViewRestaurant: () => void;
}

const ActionButtons = ({ 
  video, 
  isLiked, 
  onLike, 
  onShare, 
  onComment, 
  onViewRestaurant 
}: ActionButtonsProps) => {
  return (
    <div className="absolute right-4 top-1/3 flex flex-col items-center space-y-8 z-20">
      <div className="flex flex-col items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onLike}
          className="rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white w-12 h-12 hover:scale-110 transition-all"
        >
          <Heart 
            size={26} 
            className={isLiked ? "fill-primary text-primary" : "text-white hover:text-primary transition-colors"} 
          />
        </Button>
        <span className="text-white text-xs mt-1 font-medium">{video.likes}</span>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onComment}
        className="rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white w-12 h-12 hover:scale-110 transition-all"
      >
        <MessageCircle size={26} />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onShare}
        className="rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white w-12 h-12 hover:scale-110 transition-all"
      >
        <Share2 size={26} />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onViewRestaurant}
        className="rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white w-12 h-12 hover:scale-110 transition-all"
      >
        <Info size={26} />
      </Button>
    </div>
  );
};

export default ActionButtons;
