
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Upload, X, PlayCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/hooks/useAuth';
import { connectToDatabase } from '@/integrations/mongodb/client';

interface VideoUploadFormProps {
  restaurantId: string;
  onUploadComplete?: () => void;
}

const VideoUploadForm: React.FC<VideoUploadFormProps> = ({ restaurantId, onUploadComplete }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    }
  };

  const clearVideo = () => {
    setVideoFile(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
  };

  const clearThumbnail = () => {
    setThumbnailFile(null);
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile) {
      toast.error("Por favor, adicione um vídeo");
      return;
    }
    
    if (!title) {
      toast.error("Por favor, adicione um título");
      return;
    }

    setIsLoading(true);

    try {
      // In production, we would upload files to cloud storage and get URLs
      // For now, we'll simulate by using local object URLs
      const videoUrl = videoPreview || "";
      const thumbnailUrl = thumbnailPreview || `https://source.unsplash.com/random/800x600/?food,${title.toLowerCase()}`;
      
      const { db } = await connectToDatabase();
      
      // Create video entry in database
      const videoData = {
        id: crypto.randomUUID(),
        restaurante_id: restaurantId,
        titulo: title,
        descricao: description,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        views: 0,
        likes: 0,
        comentarios: 0,
        ativo: true,
        criado_em: new Date().toISOString(),
      };
      
      await db.collection('videos').insertOne(videoData);
      
      toast.success("Vídeo enviado com sucesso!");
      
      // Reset form
      setTitle('');
      setDescription('');
      clearVideo();
      clearThumbnail();
      
      // Call callback if provided
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Erro ao enviar vídeo. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium">
          Título do Vídeo
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nome do prato ou promoção"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium">
          Descrição
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva o prato e atraia seus clientes"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Video upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Vídeo
          </label>
          
          {!videoPreview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-40 bg-gray-50">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-2">MP4, MOV ou WebM (máx. 50MB)</p>
              <Button type="button" variant="outline" size="sm" asChild>
                <label>
                  Selecionar Vídeo
                  <input
                    type="file"
                    className="hidden"
                    accept="video/mp4,video/quicktime,video/webm"
                    onChange={handleVideoChange}
                  />
                </label>
              </Button>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden h-40 bg-black">
              <video 
                src={videoPreview} 
                className="h-full w-full object-contain"
                controls
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={clearVideo}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Thumbnail upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Miniatura (Opcional)
          </label>
          
          {!thumbnailPreview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-40 bg-gray-50">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-2">JPG, PNG (máx. 5MB)</p>
              <Button type="button" variant="outline" size="sm" asChild>
                <label>
                  Selecionar Imagem
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png"
                    onChange={handleThumbnailChange}
                  />
                </label>
              </Button>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden h-40">
              <img 
                src={thumbnailPreview} 
                className="h-full w-full object-cover"
                alt="Thumbnail preview"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={clearThumbnail}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="pt-2">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Enviando..." : "Publicar Vídeo"}
        </Button>
      </div>
      
      <div className="text-sm text-gray-500 space-y-1">
        <p>Dicas para criar vídeos mais atrativos:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Grave na vertical (9:16) como TikTok/Instagram Reels</li>
          <li>Mantenha entre 15-60 segundos para maior engajamento</li>
          <li>Mostre o prato em detalhes e de forma atraente</li>
          <li>Use boa iluminação</li>
        </ul>
      </div>
    </form>
  );
};

export default VideoUploadForm;
