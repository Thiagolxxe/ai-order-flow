
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Scissors, Music, Play, Pause, Save, X, SkipBack, SkipForward } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MusicSelector from './MusicSelector';
import VideoTrimmer from './VideoTrimmer';

interface VideoEditorProps {
  videoFile: File | null;
  onSave: (editedVideo: File, audioTrack: AudioTrack | null) => void;
  onClose: () => void;
}

export interface AudioTrack {
  id: string;
  name: string;
  artist: string;
  url: string;
  duration: number;
}

const VideoEditor: React.FC<VideoEditorProps> = ({ videoFile, onSave, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [activeTab, setActiveTab] = useState('trim');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  // Trim settings
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  
  // Selected music track
  const [selectedTrack, setSelectedTrack] = useState<AudioTrack | null>(null);

  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [videoFile]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setEndTime(video.duration);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      // Loop video between start and end points during preview
      if (video.currentTime >= endTime) {
        video.currentTime = startTime;
      }
    };
    
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [startTime, endTime]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      // If at the end of trimmed section, go back to start
      if (video.currentTime >= endTime) {
        video.currentTime = startTime;
      }
      video.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const value = newVolume[0];
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
    }
  };

  const handleSeek = (newTime: number[]) => {
    const value = newTime[0];
    setCurrentTime(value);
    if (videoRef.current) {
      videoRef.current.currentTime = value;
    }
  };

  const handleTrackSelect = (track: AudioTrack) => {
    setSelectedTrack(track);
    toast.success(`Música selecionada: ${track.name}`);
  };

  const handleSave = async () => {
    if (!videoFile || !videoRef.current) {
      toast.error("Nenhum vídeo encontrado para editar");
      return;
    }
    
    try {
      // In a real implementation, we would use libraries like FFmpeg.wasm or WebAssembly
      // to process video and audio. For now, we'll simulate this.
      toast.info("Processando o vídeo...");
      
      // Simulate video processing with compression
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Vídeo processado com sucesso!");
      onSave(videoFile, selectedTrack);
    } catch (error) {
      console.error("Error processing video:", error);
      toast.error("Erro ao processar o vídeo");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!videoFile || !videoUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p>Nenhum vídeo selecionado</p>
        <Button onClick={onClose} className="mt-4">Fechar</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Video preview */}
      <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden relative">
        <video 
          ref={videoRef} 
          src={videoUrl} 
          className="w-full h-full object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Video controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-2 text-white">
            <button onClick={togglePlayPause} className="p-2 bg-white/20 rounded-full">
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            <span className="text-sm">{formatTime(currentTime)}</span>
            
            <Slider 
              className="flex-1 mx-2"
              value={[currentTime]}
              min={0}
              max={duration}
              step={0.01}
              onValueChange={handleSeek}
            />
            
            <span className="text-sm">{formatTime(duration)}</span>
            
            <Slider 
              className="w-20"
              value={[volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>
      </div>
      
      {/* Editing tools */}
      <div className="mt-4 flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="trim">
              <Scissors className="mr-2 h-4 w-4" />
              Cortar Vídeo
            </TabsTrigger>
            <TabsTrigger value="audio">
              <Music className="mr-2 h-4 w-4" />
              Trilha Sonora
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="trim" className="mt-4">
            <VideoTrimmer 
              duration={duration}
              startTime={startTime}
              endTime={endTime}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
              currentTime={currentTime}
              videoRef={videoRef}
            />
          </TabsContent>
          
          <TabsContent value="audio" className="mt-4">
            <MusicSelector onTrackSelect={handleTrackSelect} selectedTrack={selectedTrack} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Actions */}
      <div className="mt-4 flex justify-between">
        <Button variant="outline" onClick={onClose}>
          <X className="mr-2 h-4 w-4" /> Cancelar
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Salvar Edições
        </Button>
      </div>
    </div>
  );
};

export default VideoEditor;
