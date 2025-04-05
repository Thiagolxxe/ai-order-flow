
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { connectToDatabase } from '@/integrations/mongodb/client';
import VideoManagement from '@/components/restaurant/VideoManagement';

const RestaurantAdmin = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        toast.error('Você precisa estar logado para acessar esta página');
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        const { db } = await connectToDatabase();
        
        // Check if user is a restaurant owner
        const roles = await db.collection('funcoes_usuario')
          .find({ usuario_id: user?.id, role_name: 'proprietario' })
          .toArray();
          
        if (!roles || roles.length === 0) {
          toast.error('Você não tem permissão para acessar esta página');
          navigate('/');
          return;
        }
        
        // Get restaurant data
        const restaurantData = await db.collection('restaurantes')
          .find({ proprietario_id: user?.id })
          .toArray();
          
        if (!restaurantData || restaurantData.length === 0) {
          toast.error('Restaurante não encontrado');
          navigate('/');
          return;
        }
        
        setRestaurant(restaurantData[0]);
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
        toast.error('Erro ao carregar dados do restaurante');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [user, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="w-full h-96 flex items-center justify-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container py-10">
        <div className="w-full h-96 flex items-center justify-center">
          <p>Nenhum restaurante encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Painel de Administração</h1>
      
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
          <TabsTrigger value="menu">Cardápio</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pedidos Hoje</CardTitle>
                <CardDescription>Total de pedidos recebidos hoje</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">0</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Faturamento</CardTitle>
                <CardDescription>Faturamento total do dia</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">R$ 0,00</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Visualizações</CardTitle>
                <CardDescription>Visualizações de vídeos hoje</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">0</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Pedidos Recentes</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground py-8">Nenhum pedido recente</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="videos">
          <Card>
            <CardContent className="p-6">
              <VideoManagement restaurantId={restaurant.id} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="menu">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Gerenciar Cardápio</h2>
              <p className="text-center text-muted-foreground py-8">
                Funcionalidade de gerenciamento de cardápio em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Gerenciar Pedidos</h2>
              <p className="text-center text-muted-foreground py-8">
                Funcionalidade de gerenciamento de pedidos em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Configurações do Restaurante</h2>
              <p className="text-center text-muted-foreground py-8">
                Funcionalidade de configurações em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantAdmin;
