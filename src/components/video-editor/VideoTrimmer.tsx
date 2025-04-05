
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoTrimmerProps {
  duration: number;
  startTime: number;
  endTime: number;
  onStartTimeChange: (time: number) => void;
  onEndTimeChange: (time: number) => void;
  currentTime: number;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const VideoTrimmer: React.FC<VideoTrimmerProps> = ({
  duration,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  currentTime,
  videoRef
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleRangeChange = (values: number[]) => {
    const [start, end] = values;
    onStartTimeChange(start);
    onEndTimeChange(end);
  };

  const jumpToStart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
    }
  };

  const jumpToEnd = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = endTime;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Cortar Vídeo</h3>
        <p className="text-sm text-muted-foreground">
          Defina os pontos de início e fim do seu vídeo para remover partes indesejadas.
        </p>
      </div>

      <div className="relative pt-6 pb-2">
        {/* Timeline background */}
        <div className="absolute inset-x-0 h-2 bg-muted rounded-full"></div>
        
        {/* Progress indicator */}
        <div 
          className="absolute h-2 bg-primary rounded-full" 
          style={{ 
            left: `${(startTime / duration) * 100}%`, 
            width: `${((endTime - startTime) / duration) * 100}%`
          }}
        ></div>
        
        {/* Current position indicator */}
        <div 
          className="absolute w-1 h-4 bg-foreground rounded-full top-5"
          style={{ left: `calc(${(currentTime / duration) * 100}% - 2px)` }}
        ></div>
        
        {/* Range slider */}
        <Slider
          value={[startTime, endTime]}
          min={0}
          max={duration}
          step={0.1}
          minStepsBetweenThumbs={1}
          onValueChange={handleRangeChange}
          className="mt-6"
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Ponto inicial</p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={jumpToStart}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{formatTime(startTime)}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Ponto final</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{formatTime(endTime)}</span>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={jumpToEnd}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-3 bg-muted rounded-lg">
        <p className="text-sm">
          Duração selecionada: <span className="font-semibold">{formatTime(endTime - startTime)}</span>
        </p>
      </div>
    </div>
  );
};

export default VideoTrimmer;
