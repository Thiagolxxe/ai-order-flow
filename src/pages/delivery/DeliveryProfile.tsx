import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { Upload, Save, Image, Plus, X, Play } from 'lucide-react';
import { connectToDatabase } from '@/integrations/mongodb/client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';

// Form validation schema
const profileFormSchema = z.object({
  nome: z.string().min(2, { message: 'Nome é obrigatório' }),
  telefone: z.string().min(10, { message: 'Telefone inválido' }),
  endereco: z.string().min(5, { message: 'Endereço é obrigatório' }),
  tipo_veiculo: z.string().min(2, { message: 'Tipo de veículo é obrigatório' }),
  placa: z.string().min(5, { message: 'Placa é obrigatória' }),
  biografia: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const DeliveryProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [videos, setVideos] = useState<any[]>([]);

  // Form setup
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nome: '',
      telefone: '',
      endereco: '',
      tipo_veiculo: '',
      placa: '',
      biografia: '',
    },
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Você precisa estar logado para acessar esta página');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  const onSubmit = async (data: ProfileFormValues) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Connect to MongoDB
      const { db } = await connectToDatabase();
      
      // Update driver information
      const driverResult = await db.collection('drivers').updateOne(
        { id: user.id },
        { 
          $set: {
            tipo_veiculo: data.tipo_veiculo,
            placa: data.placa,
            ativo: true
          }
        }
      );
      
      if (!driverResult.data) {
        throw new Error('Falha ao atualizar informações do entregador');
      }
      
      // Update user profile
      const profileResult = await db.collection('profiles').updateOne(
        { id: user.id },
        {
          $set: {
            nome: data.nome,
            telefone: data.telefone,
            endereco: data.endereco
          }
        }
      );
        
      if (!profileResult.data) {
        throw new Error('Falha ao atualizar perfil de usuário');
      }
      
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      // Todo: Upload to storage
    }
  };
  
  const handleVideoUpload = () => {
    // Placeholder for video upload functionality
    toast.info('Funcionalidade de upload de vídeo em desenvolvimento');
  };
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Perfil de Entregador</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
          <TabsTrigger value="menu">Cardápio</TabsTrigger>
        </TabsList>
        
        {/* Perfil Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e do veículo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Imagem de perfil */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-muted relative">
                    <img 
                      src={profileImage || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300"} 
                      alt="Foto de perfil" 
                      className="w-full h-full object-cover"
                    />
                    <label 
                      htmlFor="profile-upload" 
                      className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Upload className="w-6 h-6 text-white" />
                    </label>
                    <input 
                      id="profile-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleProfileImageChange}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Clique para alterar</p>
                </div>
                
                {/* Formulário de perfil */}
                <div className="flex-1">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="telefone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input placeholder="(00) 00000-0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="endereco"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu endereço completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Separator className="my-4" />
                      <h3 className="text-lg font-medium">Informações do Veículo</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="tipo_veiculo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Veículo</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Moto, Carro" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="placa"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Placa</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: ABC-1234" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="biografia"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Biografia</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Conte um pouco sobre você..."
                                className="resize-none min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                type="submit" 
                onClick={form.handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Vídeos Tab */}
        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>Meus Vídeos</CardTitle>
              <CardDescription>
                Gerencie os vídeos de entrega que você compartilhou
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {videos.length === 0 ? (
                  <div className="col-span-full text-center py-10">
                    <Image className="w-12 h-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 font-medium">Nenhum vídeo encontrado</h3>
                    <p className="text-sm text-muted-foreground">
                      Compartilhe vídeos de suas entregas para engajar os clientes
                    </p>
                  </div>
                ) : (
                  // Placeholder for when videos are added
                  videos.map((video) => (
                    <Card key={video.id} className="overflow-hidden">
                      <div className="aspect-video bg-muted relative">
                        <img 
                          src={video.thumbnailUrl} 
                          alt={video.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button variant="ghost" size="icon" className="rounded-full bg-black/50 hover:bg-black/70">
                            <Play className="h-8 w-8 text-white" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <h4 className="font-medium truncate">{video.title}</h4>
                        <p className="text-sm text-muted-foreground">{video.views} visualizações</p>
                      </CardContent>
                    </Card>
                  ))
                )}
                
                {/* Upload button */}
                <Card className="overflow-hidden cursor-pointer border-dashed" onClick={handleVideoUpload}>
                  <div className="aspect-video flex flex-col items-center justify-center p-4">
                    <Plus className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="font-medium">Adicionar Vídeo</p>
                    <p className="text-sm text-muted-foreground">Compartilhe um novo vídeo</p>
                  </div>
                </Card>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Dicas para gravação de vídeos</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Grave vídeos na posição vertical (modo retrato)</li>
                  <li>• Mantenha os vídeos curtos, entre 15-60 segundos</li>
                  <li>• Mostre claramente o prato ou produto</li>
                  <li>• Use boa iluminação</li>
                  <li>• Evite barulhos de fundo</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Cardápio Tab */}
        <TabsContent value="menu">
          <Card>
            <CardHeader>
              <CardTitle>Meu Cardápio</CardTitle>
              <CardDescription>
                Adicione e gerencie itens do seu cardápio que aparecem nos vídeos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="flex gap-2" onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
                  <Plus className="h-4 w-4" /> Adicionar Item
                </Button>
                
                <div className="rounded-md border">
                  <div className="p-4">
                    <h3 className="text-lg font-medium">Ainda não há itens no cardápio</h3>
                    <p className="text-sm text-muted-foreground">
                      Adicione itens do seu cardápio para exibir nos seus vídeos
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryProfile;
