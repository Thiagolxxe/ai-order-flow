
import React, { useState, useEffect } from 'react';
import { Play, Pause, Music, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { AudioTrack } from './VideoEditor';

// Mock creative commons music data
const MOCK_AUDIO_TRACKS: AudioTrack[] = [
  {
    id: '1',
    name: 'Summer Vibes',
    artist: 'John Smith',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 238,
  },
  {
    id: '2',
    name: 'Jazzy Mood',
    artist: 'Maria Johnson',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 175,
  },
  {
    id: '3',
    name: 'Peaceful Morning',
    artist: 'Robert Williams',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 201,
  },
  {
    id: '4',
    name: 'Coffee Shop',
    artist: 'Emma Clarke',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 159,
  },
  {
    id: '5',
    name: 'Urban Groove',
    artist: 'David Miller',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    duration: 187,
  },
];

interface MusicSelectorProps {
  onTrackSelect: (track: AudioTrack) => void;
  selectedTrack: AudioTrack | null;
}

const MusicSelector: React.FC<MusicSelectorProps> = ({ onTrackSelect, selectedTrack }) => {
  const [tracks, setTracks] = useState<AudioTrack[]>(MOCK_AUDIO_TRACKS);
  const [searchTerm, setSearchTerm] = useState('');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    // Filter tracks based on search term
    if (searchTerm) {
      const filtered = MOCK_AUDIO_TRACKS.filter(track => 
        track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setTracks(filtered);
    } else {
      setTracks(MOCK_AUDIO_TRACKS);
    }
  }, [searchTerm]);

  useEffect(() => {
    // Initialize audio element
    const audio = new Audio();
    audio.volume = volume;
    setAudioElement(audio);

    // Clean up audio element on unmount
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);

  useEffect(() => {
    if (audioElement) {
      audioElement.volume = volume;
    }
  }, [volume, audioElement]);

  const togglePlayTrack = (track: AudioTrack) => {
    if (!audioElement) return;

    if (playingTrackId === track.id) {
      // Pause currently playing track
      audioElement.pause();
      setPlayingTrackId(null);
    } else {
      // Stop any playing audio and play the new track
      audioElement.pause();
      audioElement.src = track.url;
      audioElement.play().catch(err => console.error("Error playing audio:", err));
      setPlayingTrackId(track.id);
      
      // When audio ends, reset the playing state
      audioElement.onended = () => {
        setPlayingTrackId(null);
      };
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Trilha Sonora</h3>
        <p className="text-sm text-muted-foreground">
          Escolha uma música Creative Commons para adicionar ao seu vídeo.
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar música ou artista..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-muted-foreground" />
          <Slider
            className="w-24"
            value={[volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(value) => setVolume(value[0])}
          />
        </div>
      </div>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto p-1">
        {tracks.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">Nenhuma música encontrada</p>
        ) : (
          tracks.map(track => (
            <div 
              key={track.id}
              className={`p-3 rounded-lg border ${selectedTrack?.id === track.id ? 'border-primary bg-primary/5' : 'border-border'} flex items-center justify-between`}
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{track.name}</h4>
                <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                <p className="text-xs text-muted-foreground">{formatTime(track.duration)}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePlayTrack(track)}
                >
                  {playingTrackId === track.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant={selectedTrack?.id === track.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTrackSelect(track)}
                >
                  {selectedTrack?.id === track.id ? 'Selecionada' : 'Selecionar'}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 bg-muted rounded-lg flex items-start gap-3">
        <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p>Todas as músicas são licenciadas sob Creative Commons e podem ser usadas em seus vídeos.</p>
          <a 
            href="https://creativecommons.org/licenses/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary inline-flex items-center gap-1 mt-1 hover:underline"
          >
            Saiba mais sobre licenças Creative Commons
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default MusicSelector;
