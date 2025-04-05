
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash, Edit, Play, Pause, Eye, ThumbsUp } from 'lucide-react';
import { connectToDatabase } from '@/integrations/mongodb/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import VideoUploadForm from './VideoUploadForm';

interface Video {
  _id: string;
  titulo: string;
  descricao?: string;
  video_url: string;
  thumbnail_url?: string;
  views?: number;
  likes?: number;
  criado_em: string;
  ativo: boolean;
}

const VideoManagement = ({ restaurantId }: { restaurantId: string }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const { db } = await connectToDatabase();
      const result = await db.collection('videos').find({ restaurante_id: restaurantId });
      
      if (result.data) {
        // Sort videos by creation date (newest first)
        const sortedVideos = [...result.data].sort((a, b) => 
          new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
        );
        setVideos(sortedVideos);
      } else {
        setVideos([]);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Falha ao carregar vídeos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [restaurantId]);

  const handleVideoUploadSuccess = () => {
    setShowUploadForm(false);
    setSelectedVideo(null);
    fetchVideos();
    toast.success('Vídeo salvo com sucesso!');
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) return;
    
    try {
      const { db } = await connectToDatabase();
      await db.collection('videos').updateOne(
        { _id: videoId },
        { $set: { ativo: false } }
      );
      
      toast.success('Vídeo excluído com sucesso!');
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Falha ao excluir vídeo');
    }
  };

  const handleEditVideo = (video: Video) => {
    setSelectedVideo(video);
    setShowUploadForm(true);
  };

  const toggleVideoPlay = (videoId: string) => {
    setPlayingVideoId(prev => prev === videoId ? null : videoId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Vídeos</h2>
          <Skeleton className="h-9 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full rounded-md" />
                <div className="mt-2 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (showUploadForm) {
    return (
      <VideoUploadForm 
        restaurantId={restaurantId} 
        onSuccess={handleVideoUploadSuccess}
        onCancel={() => {
          setShowUploadForm(false);
          setSelectedVideo(null);
        }}
        videoToEdit={selectedVideo}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vídeos</h2>
        <Button onClick={() => setShowUploadForm(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Vídeo
        </Button>
      </div>
      
      {videos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Play className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Sem vídeos publicados</h3>
            <p className="text-muted-foreground mb-4">
              Comece a adicionar vídeos de seus pratos para atrair mais clientes!
            </p>
            <Button onClick={() => setShowUploadForm(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Primeiro Vídeo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map(video => (
            <Card key={video._id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{video.titulo}</CardTitle>
                {video.descricao && (
                  <CardDescription className="line-clamp-2">{video.descricao}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black">
                  {playingVideoId === video._id ? (
                    <video 
                      src={video.video_url} 
                      className="w-full h-full object-contain" 
                      autoPlay 
                      controls
                    />
                  ) : (
                    <>
                      <img 
                        src={video.thumbnail_url || '/placeholder.svg'} 
                        alt={video.titulo}
                        className="w-full h-full object-cover" 
                      />
                      <div 
                        className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30"
                        onClick={() => toggleVideoPlay(video._id)}
                      >
                        <div className="bg-white/90 rounded-full p-3">
                          <Play className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{video.views || 0} visualizações</span>
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      <span>{video.likes || 0} curtidas</span>
                    </div>
                    <div>
                      {new Date(video.criado_em).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <Button variant="outline" size="sm" onClick={() => handleEditVideo(video)}>
                  <Edit className="h-4 w-4 mr-1" /> Editar
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteVideo(video._id)}>
                  <Trash className="h-4 w-4 mr-1" /> Excluir
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoManagement;
