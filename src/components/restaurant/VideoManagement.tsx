import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Play, Plus, Trash2, Eye, ThumbsUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { connectToDatabase } from '@/integrations/mongodb/client';
import VideoUploadForm from './VideoUploadForm';

interface VideoItem {
  id: string;
  titulo: string;
  descricao?: string;
  video_url: string;
  thumbnail_url?: string;
  views: number;
  likes: number;
  comentarios: number;
  criado_em: string;
}

interface VideoManagementProps {
  restaurantId: string;
}

const VideoManagement: React.FC<VideoManagementProps> = ({ restaurantId }) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const { db } = await connectToDatabase();
      const result = await db.collection('videos')
        .find({ restaurante_id: restaurantId })
        .toArray();
      
      // Sort by created date (newest first)
      const sortedVideos = result.sort((a, b) => {
        return new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime();
      });
      
      setVideos(sortedVideos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("Erro ao carregar vídeos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [restaurantId]);

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Tem certeza que deseja excluir este vídeo?")) {
      return;
    }

    try {
      const { db } = await connectToDatabase();
      await db.collection('videos').deleteOne({ id: videoId });
      
      // Remove video from local state
      setVideos(videos.filter(video => video.id !== videoId));
      toast.success("Vídeo excluído com sucesso");
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Erro ao excluir vídeo");
    }
  };

  const handleUploadComplete = () => {
    setUploadDialogOpen(false);
    fetchVideos();
  };

  const openVideoPreview = (video: VideoItem) => {
    setCurrentVideo(video);
  };

  const closeVideoPreview = () => {
    setCurrentVideo(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Vídeos</h2>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Vídeo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Vídeo</DialogTitle>
            </DialogHeader>
            <VideoUploadForm 
              restaurantId={restaurantId} 
              onUploadComplete={handleUploadComplete}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="popular">Populares</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          {isLoading ? (
            <div className="text-center py-8">Carregando vídeos...</div>
          ) : videos.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-muted/50">
              <p className="mb-4 text-muted-foreground">Você ainda não tem vídeos publicados</p>
              <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Vídeo
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map(video => (
                <div key={video.id} className="border rounded-lg overflow-hidden bg-card">
                  <div 
                    className="aspect-[9/16] relative cursor-pointer"
                    onClick={() => openVideoPreview(video)}
                  >
                    {video.thumbnail_url ? (
                      <img 
                        src={video.thumbnail_url} 
                        alt={video.titulo} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">Sem miniatura</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                      <h3 className="text-white font-medium truncate">{video.titulo}</h3>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col gap-2">
                    <div className="flex items-center text-sm text-muted-foreground justify-between">
                      <div className="flex gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" /> {video.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" /> {video.likes || 0}
                        </span>
                      </div>
                      <span>
                        {new Date(video.criado_em).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteVideo(video.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="popular" className="mt-4">
          {isLoading ? (
            <div className="text-center py-8">Carregando vídeos...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos
                .sort((a, b) => (b.views + b.likes) - (a.views + a.likes))
                .slice(0, 6)
                .map(video => (
                  <div key={video.id} className="border rounded-lg overflow-hidden bg-card">
                    <div 
                      className="aspect-[9/16] relative cursor-pointer"
                      onClick={() => openVideoPreview(video)}
                    >
                      {video.thumbnail_url ? (
                        <img 
                          src={video.thumbnail_url} 
                          alt={video.titulo} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">Sem miniatura</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                        <h3 className="text-white font-medium truncate">{video.titulo}</h3>
                      </div>
                    </div>
                    <div className="p-3 flex flex-col gap-2">
                      <div className="flex items-center text-sm text-muted-foreground justify-between">
                        <div className="flex gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" /> {video.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" /> {video.likes || 0}
                          </span>
                        </div>
                        <span>
                          {new Date(video.criado_em).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteVideo(video.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Excluir
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {currentVideo && (
        <Dialog open={!!currentVideo} onOpenChange={closeVideoPreview}>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{currentVideo.titulo}</DialogTitle>
            </DialogHeader>
            <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden">
              <video 
                src={currentVideo.video_url} 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              />
            </div>
            {currentVideo.descricao && (
              <p className="text-sm">{currentVideo.descricao}</p>
            )}
            <div className="flex justify-between text-sm text-muted-foreground">
              <div className="flex gap-4">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" /> {currentVideo.views || 0} visualizações
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" /> {currentVideo.likes || 0} curtidas
                </span>
              </div>
              <span>
                Publicado em {new Date(currentVideo.criado_em).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default VideoManagement;
