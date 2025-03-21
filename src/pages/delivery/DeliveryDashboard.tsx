
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BagIcon, 
  ClockIcon, 
  DeliveryIcon,
  StatsIcon,
  LocationIcon,
  ChatIcon,
  SuccessIcon
} from '@/assets/icons';
import { useToast } from '@/hooks/use-toast';

// Componente de Card de Pedido
const DeliveryOrderCard = ({ 
  order, 
  onAccept,
  onStart,
  onComplete
}: { 
  order: any;
  onAccept?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
}) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">Pedido #{order.id}</h3>
            <p className="text-sm text-muted-foreground">{order.restaurant}</p>
          </div>
          <div>
            <Badge className={
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
              order.status === 'in_progress' ? 'bg-indigo-100 text-indigo-800' :
              'bg-green-100 text-green-800'
            }>
              {order.status === 'pending' ? 'Disponível' : 
               order.status === 'accepted' ? 'Aceito' :
               order.status === 'in_progress' ? 'Em andamento' :
               'Entregue'}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Distância</p>
            <p className="font-medium">{order.distance}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Valor</p>
            <p className="font-medium">R$ {order.value.toFixed(2).replace('.', ',')}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Endereço</p>
            <p className="font-medium">{order.address}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tempo estimado</p>
            <p className="font-medium">{order.eta}</p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          {order.status === 'pending' && onAccept && (
            <Button onClick={onAccept}>Aceitar Entrega</Button>
          )}
          {order.status === 'accepted' && onStart && (
            <Button onClick={onStart}>Iniciar Entrega</Button>
          )}
          {order.status === 'in_progress' && onComplete && (
            <Button onClick={onComplete}>Concluir Entrega</Button>
          )}
          <Button variant="outline">
            Ver no Mapa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Painel de Entregador
const DeliveryDashboard = () => {
  const { toast } = useToast();
  const [availableOrders, setAvailableOrders] = useState([
    {
      id: '4827',
      restaurant: 'Urban Burger Bistro',
      distance: '2,3 km',
      value: 12.90,
      address: 'Rua Augusta, 1500',
      eta: '25 min',
      status: 'pending'
    },
    {
      id: '4828',
      restaurant: 'Sushi Express',
      distance: '3,1 km',
      value: 14.50,
      address: 'Av. Paulista, 900',
      eta: '30 min',
      status: 'pending'
    }
  ]);
  
  const [myDeliveries, setMyDeliveries] = useState([
    {
      id: '4826',
      restaurant: 'Pizza Delícia',
      distance: '1,5 km',
      value: 10.00,
      address: 'Rua Oscar Freire, 200',
      eta: '15 min',
      status: 'in_progress'
    },
    {
      id: '4825',
      restaurant: 'Padaria Pão Bom',
      distance: '0,8 km',
      value: 8.50,
      address: 'Alameda Santos, 50',
      eta: '10 min',
      status: 'accepted'
    }
  ]);
  
  const [completedDeliveries, setCompletedDeliveries] = useState([
    {
      id: '4824',
      restaurant: 'Restaurante do Chef',
      distance: '2,7 km',
      value: 15.00,
      address: 'Rua dos Pinheiros, 300',
      eta: '30 min',
      status: 'completed',
      completed_at: '18:45'
    },
    {
      id: '4823',
      restaurant: 'China in Box',
      distance: '3,5 km',
      value: 18.00,
      address: 'Rua Haddock Lobo, 800',
      eta: '35 min',
      status: 'completed',
      completed_at: '17:20'
    }
  ]);

  const handleAcceptDelivery = (orderId: string) => {
    const acceptedOrder = availableOrders.find(order => order.id === orderId);
    if (acceptedOrder) {
      const updatedOrder = { ...acceptedOrder, status: 'accepted' };
      setAvailableOrders(prev => prev.filter(order => order.id !== orderId));
      setMyDeliveries(prev => [...prev, updatedOrder]);
      
      toast({
        title: "Entrega aceita",
        description: `Você aceitou a entrega #${orderId}`,
      });
    }
  };

  const handleStartDelivery = (orderId: string) => {
    setMyDeliveries(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'in_progress' } 
          : order
      )
    );
    
    toast({
      title: "Entrega iniciada",
      description: `Você iniciou a entrega #${orderId}`,
    });
  };

  const handleCompleteDelivery = (orderId: string) => {
    const completedOrder = myDeliveries.find(order => order.id === orderId);
    if (completedOrder) {
      const updatedOrder = { 
        ...completedOrder, 
        status: 'completed',
        completed_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMyDeliveries(prev => prev.filter(order => order.id !== orderId));
      setCompletedDeliveries(prev => [updatedOrder, ...prev]);
      
      toast({
        title: "Entrega concluída",
        description: `Você concluiu a entrega #${orderId}`,
      });
    }
  };

  // Estatísticas do dia
  const dailyStats = {
    deliveries: myDeliveries.length + completedDeliveries.length,
    earnings: completedDeliveries.reduce((total, order) => total + order.value, 0),
    rating: 4.8,
    hours: 5.5
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Painel do Entregador</h1>
      
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Entregas Hoje</CardTitle>
            <DeliveryIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyStats.deliveries}</div>
            <p className="text-xs text-muted-foreground">
              {myDeliveries.length} em andamento
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ganhos Hoje</CardTitle>
            <StatsIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {dailyStats.earnings.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-muted-foreground">
              + R$ {myDeliveries.reduce((total, order) => total + order.value, 0).toFixed(2).replace('.', ',')} em andamento
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
            <StarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyStats.rating}</div>
            <p className="text-xs text-muted-foreground">3 novas avaliações</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Horas Online</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyStats.hours}h</div>
            <p className="text-xs text-muted-foreground">
              Meta: 8h
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Abas de entregas */}
      <Tabs defaultValue="available" className="space-y-4">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="available">
            Disponíveis ({availableOrders.length})
          </TabsTrigger>
          <TabsTrigger value="myDeliveries">
            Minhas Entregas ({myDeliveries.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Concluídas ({completedDeliveries.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="available">
          {availableOrders.length > 0 ? (
            availableOrders.map(order => (
              <DeliveryOrderCard 
                key={order.id} 
                order={order} 
                onAccept={() => handleAcceptDelivery(order.id)}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <DeliveryIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-medium">Sem entregas disponíveis</h3>
              <p className="text-muted-foreground">
                Aguarde novas entregas ou verifique mais tarde.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="myDeliveries">
          {myDeliveries.length > 0 ? (
            myDeliveries.map(order => (
              <DeliveryOrderCard 
                key={order.id} 
                order={order}
                onStart={order.status === 'accepted' ? () => handleStartDelivery(order.id) : undefined}
                onComplete={order.status === 'in_progress' ? () => handleCompleteDelivery(order.id) : undefined}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <BagIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-medium">Nenhuma entrega ativa</h3>
              <p className="text-muted-foreground">
                Aceite novas entregas para começar.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {completedDeliveries.length > 0 ? (
            completedDeliveries.map(order => (
              <DeliveryOrderCard key={order.id} order={order} />
            ))
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <SuccessIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-medium">Nenhuma entrega concluída</h3>
              <p className="text-muted-foreground">
                Suas entregas concluídas aparecerão aqui.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryDashboard;
