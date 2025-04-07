import React, { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, X, Music, Scissors, Globe } from 'lucide-react';
import { supabaseClient } from '@/integrations/supabase/client';
import { connectToDatabase } from '@/integrations/mongodb/client';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface Video {
  id?: string;
  titulo: string;
  descricao: string;
  video_url: string;
  thumbnail_url?: string;
  restaurante_id: string;
  item_cardapio_id?: string;
}

export interface VideoUploadFormProps {
  restaurantId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  videoToEdit?: Video;
}

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  license: string;
}

// Mock music library (Creative Commons tracks)
const musicLibrary: MusicTrack[] = [
  {
    id: '1',
    title: 'Acoustic Vibes',
    artist: 'Creative Sound',
    url: 'https://example.com/tracks/acoustic-vibes.mp3',
    license: 'CC BY 4.0'
  },
  {
    id: '2',
    title: 'Jazz Cafe',
    artist: 'Open Music',
    url: 'https://example.com/tracks/jazz-cafe.mp3',
    license: 'CC BY-SA 4.0'
  },
  {
    id: '3',
    title: 'Summer Breeze',
    artist: 'Free Sounds',
    url: 'https://example.com/tracks/summer-breeze.mp3',
    license: 'CC BY-NC 4.0'
  }
];

const VideoUploadForm: React.FC<VideoUploadFormProps> = ({ 
  restaurantId, 
  onSuccess = () => {},
  onCancel = () => {},
  videoToEdit 
}) => {
  const [title, setTitle] = useState(videoToEdit?.titulo || '');
  const [description, setDescription] = useState(videoToEdit?.descricao || '');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(videoToEdit?.video_url || null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(videoToEdit?.thumbnail_url || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [videoDuration, setVideoDuration] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if the file is a video
      if (!file.type.startsWith('video/')) {
        toast.error('Por favor, selecione um arquivo de vídeo válido');
        return;
      }
      
      // Check file size (limit to 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error('O arquivo é muito grande. O tamanho máximo é 100MB');
        return;
      }
      
      setVideoFile(file);
      
      // Create a preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Reset trim values
      setTrimStart(0);
      setTrimEnd(100);
      
      // Load video metadata to get duration
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        setVideoDuration(video.duration);
      };
      video.src = url;
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      toast.error('Por favor, informe um título para o vídeo');
      return;
    }
    
    if (!videoFile && !videoToEdit) {
      toast.error('Por favor, selecione um vídeo para upload');
      return;
    }
    
    setUploading(true);
    setProgress(0);
    
    try {
      let videoUrl = videoToEdit?.video_url || '';
      
      // If we have a new video file, upload it
      if (videoFile) {
        // Compress and trim the video if needed
        const processedVideo = await processVideo(videoFile);
        
        // Generate a unique filename
        const timestamp = new Date().getTime();
        const extension = videoFile.name.split('.').pop();
        const filename = `${restaurantId}_${timestamp}.${extension}`;
        
        // Upload to storage
        const { data, error } = await supabaseClient.storage
          .from('videos')
          .upload(`restaurant/${restaurantId}/${filename}`, processedVideo, {
            upsert: true,
            // Remove the onUploadProgress as it's not in the type
          });
          
        if (error) {
          throw new Error(`Erro ao fazer upload do vídeo: ${error.message}`);
        }
        
        // Get the public URL
        const { data: urlData } = supabaseClient.storage
          .from('videos')
          .getPublicUrl(`restaurant/${restaurantId}/${filename}`);
          
        videoUrl = urlData.publicUrl;
        
        // Generate thumbnail from the video (this is simplified for this example)
        const thumbnailFilename = `${restaurantId}_${timestamp}_thumb.jpg`;
        const thumbnailBlob = await generateThumbnail(videoFile);
        
        const { data: thumbData, error: thumbError } = await supabaseClient.storage
          .from('videos')
          .upload(`restaurant/${restaurantId}/thumbnails/${thumbnailFilename}`, thumbnailBlob, {
            upsert: true,
          });
          
        if (thumbError) {
          console.error('Erro ao fazer upload da thumbnail:', thumbError);
          // Continue without thumbnail if there's an error
        } else {
          const { data: thumbUrlData } = supabaseClient.storage
            .from('videos')
            .getPublicUrl(`restaurant/${restaurantId}/thumbnails/${thumbnailFilename}`);
            
          setThumbnailUrl(thumbUrlData.publicUrl);
        }
      }
      
      // Save the video metadata to the database
      const { db } = await connectToDatabase();
      
      // Prepare the video data
      const videoData: Video = {
        titulo: title,
        descricao: description,
        video_url: videoUrl,
        restaurante_id: restaurantId,
        thumbnail_url: thumbnailUrl || undefined
      };
      
      if (videoToEdit?.id) {
        // Update existing video
        const result = await db.collection('videos').updateOne(
          { _id: videoToEdit.id },
          { $set: videoData }
        );
        
        if (!result || result.error) {
          throw new Error('Erro ao atualizar vídeo no banco de dados');
        }
        
        toast.success('Vídeo atualizado com sucesso!');
      } else {
        // Create new video
        const result = await db.collection('videos').insertOne({
          ...videoData,
          views: 0,
          likes: 0,
          comentarios: 0,
          ativo: true,
          criado_em: new Date()
        });
        
        if (!result || result.error) {
          throw new Error('Erro ao salvar vídeo no banco de dados');
        }
        
        toast.success('Vídeo enviado com sucesso!');
      }
      
      // Clean up
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      // Reset form and notify parent
      setTitle('');
      setDescription('');
      setVideoFile(null);
      setPreviewUrl(null);
      setThumbnailUrl(null);
      onSuccess();
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast.error(error.message || 'Erro ao enviar vídeo');
    } finally {
      setUploading(false);
    }
  };

  // Simple function to process the video (in a real app, this would use a video processing library)
  const processVideo = async (file: File): Promise<Blob> => {
    // In a real implementation, this would compress and trim the video
    // For this mock version, we'll just return the original file
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Apply music if selected
    if (selectedTrack) {
      console.log(`Applying music track: ${selectedTrack}`);
      // In a real implementation, this would mix the audio track with the video
    }
    
    // Apply trimming if needed
    if (trimStart > 0 || trimEnd < 100) {
      console.log(`Trimming video from ${trimStart}% to ${trimEnd}%`);
      // In a real implementation, this would trim the video
    }
    
    return file;
  };

  // Function to generate a thumbnail from the video
  const generateThumbnail = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadedmetadata = () => {
        // Seek to 25% of the video duration
        video.currentTime = video.duration * 0.25;
      };
      
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create thumbnail'));
            }
          },
          'image/jpeg',
          0.7 // Quality
        );
      };
      
      video.onerror = () => {
        reject(new Error('Error loading video for thumbnail generation'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const handleTrimChange = (values: number[]) => {
    setTrimStart(values[0]);
    setTrimEnd(values[1]);
    
    // Update video playback position if available
    if (videoRef.current && videoDuration > 0) {
      videoRef.current.currentTime = (videoDuration * values[0]) / 100;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateTrimmedDuration = () => {
    const totalDuration = videoDuration;
    const trimmedDuration = (totalDuration * (trimEnd - trimStart)) / 100;
    return formatTime(trimmedDuration);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{videoToEdit ? 'Editar Vídeo' : 'Publicar Novo Vídeo'}</CardTitle>
        <CardDescription>
          Compartilhe vídeos de pratos e experiências com seus clientes
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mx-4 mb-2">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="edit">Edição</TabsTrigger>
          <TabsTrigger value="music">Trilha Sonora</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Título do vídeo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição do vídeo"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
                className="resize-none h-24"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="video">Vídeo</Label>
              <div className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors" onClick={() => fileInputRef.current?.click()}>
                {previewUrl ? (
                  <div className="relative w-full">
                    <video 
                      src={previewUrl} 
                      controls 
                      className="rounded-lg w-full max-h-[300px] object-contain"
                      ref={videoRef}
                    />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideoFile(null);
                        setPreviewUrl(null);
                      }}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="font-medium text-gray-800 dark:text-gray-200">Clique para selecionar um vídeo</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      MP4, MOV ou WebM (max 100MB)
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  id="video"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </div>
            </div>
            
            {uploading && (
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span>Enviando...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </CardContent>
        </TabsContent>
        
        <TabsContent value="edit">
          <CardContent className="space-y-4">
            {previewUrl ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Cortar Vídeo</Label>
                    <span className="text-sm text-muted-foreground">
                      Duração: {calculateTrimmedDuration()}
                    </span>
                  </div>
                  <div className="px-2">
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[trimStart, trimEnd]}
                      onValueChange={handleTrimChange}
                      disabled={uploading || !previewUrl}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Início: {formatTime((videoDuration * trimStart) / 100)}</span>
                    <span>Fim: {formatTime((videoDuration * trimEnd) / 100)}</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = (videoDuration * trimStart) / 100;
                          videoRef.current.play();
                        }
                      }}
                      disabled={uploading}
                    >
                      <Scissors className="h-4 w-4 mr-2" />
                      Pré-visualizar corte
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Scissors className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Selecione um vídeo na aba Upload para editar</p>
              </div>
            )}
          </CardContent>
        </TabsContent>
        
        <TabsContent value="music">
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Selecionar Trilha Sonora</Label>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Globe className="h-3 w-3 mr-1" />
                  <span>Creative Commons</span>
                </div>
              </div>
              
              {musicLibrary.map((track) => (
                <div
                  key={track.id}
                  className={`p-3 rounded-md cursor-pointer flex items-center justify-between ${
                    selectedTrack === track.id ? 'bg-primary/10 border border-primary/20' : 'border'
                  }`}
                  onClick={() => setSelectedTrack(track.id === selectedTrack ? null : track.id)}
                >
                  <div className="flex items-center">
                    <Music className="h-4 w-4 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{track.title}</p>
                      <p className="text-xs text-muted-foreground">{track.artist}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{track.license}</div>
                </div>
              ))}
              
              {selectedTrack && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTrack(null)}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remover trilha
                  </Button>
                </div>
              )}
              
              {!musicLibrary.length && (
                <div className="text-center py-8 text-muted-foreground">
                  <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Não há trilhas sonoras disponíveis</p>
                </div>
              )}
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={uploading}>
          Cancelar
        </Button>
        <Button onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Enviando...' : videoToEdit ? 'Atualizar Vídeo' : 'Publicar Vídeo'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VideoUploadForm;
