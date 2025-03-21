import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { StarIcon, BagIcon, ClockIcon, StatsIcon } from "@/assets/icons";

const DeliveryDashboard = () => {
  const { toast } = useToast();
  const [activeOrders, setActiveOrders] = useState([
    { 
      id: 'D123', 
      restaurant: 'Burger King', 
      customer: 'João Silva',
      address: 'Rua das Flores, 123',
      status: 'waiting_pickup',
      value: 45.90,
      distance: '2.3 km',
      time: '15:30'
    },
    { 
      id: 'D124', 
      restaurant: "McDonald's",
      customer: 'Maria Santos',
      address: 'Av. Principal, 456',
      status: 'in_transit',
      value: 32.50,
      distance: '1.8 km',
      time: '15:45'
    }
  ]);

  const [deliveryHistory] = useState([
    { 
      id: 'D120', 
      restaurant: 'Pizza Hut',
      customer: 'Pedro Alves',
      status: 'delivered',
      value: 68.90,
      distance: '3.1 km',
      time: '14:15'
    },
    { 
      id: 'D121', 
      restaurant: 'Subway',
      customer: 'Ana Costa',
      status: 'delivered',
      value: 25.90,
      distance: '1.5 km',
      time: '13:45'
    }
  ]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string, className: string }> = {
      waiting_pickup: { 
        label: 'Aguardando Retirada', 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
      },
      in_transit: { 
        label: 'Em Trânsito', 
        className: 'bg-blue-100 text-blue-800 border-blue-200' 
      },
      delivered: { 
        label: 'Entregue', 
        className: 'bg-green-100 text-green-800 border-green-200' 
      }
    };

    return (
      <Badge variant="outline" className={statusMap[status]?.className || ''}>
        {statusMap[status]?.label || status}
      </Badge>
    );
  };

  const handleAcceptDelivery = (orderId: string) => {
    toast({
      title: "Pedido aceito",
      description: `Você aceitou a entrega #${orderId}`,
    });
  };

  const handleStartDelivery = (orderId: string) => {
    setActiveOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'in_transit' } 
          : order
      )
    );
    
    toast({
      title: "Entrega iniciada",
      description: `Entrega #${orderId} foi iniciada`,
    });
  };

  const handleCompleteDelivery = (orderId: string) => {
    setActiveOrders(prev => prev.filter(order => order.id !== orderId));
    
    toast({
      title: "Entrega concluída",
      description: `Entrega #${orderId} foi concluída com sucesso`,
    });
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Painel do Entregador</h1>
      
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Entregas Hoje</CardTitle>
            <BagIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+2 comparado a ontem</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ganhos Hoje</CardTitle>
            <StatsIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 156,80</div>
            <p className="text-xs text-muted-foreground">+10% comparado a ontem</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <StarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">12 avaliações hoje</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18 min</div>
            <p className="text-xs text-muted-foreground">-2 min comparado a ontem</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs de entregas */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Entregas Ativas</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Entregas Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Restaurante</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Distância</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{order.restaurant}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.address}</TableCell>
                      <TableCell>R$ {order.value.toFixed(2)}</TableCell>
                      <TableCell>{order.distance}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {order.status === 'waiting_pickup' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStartDelivery(order.id)}
                            >
                              Iniciar Entrega
                            </Button>
                          )}
                          {order.status === 'in_transit' && (
                            <Button 
                              size="sm"
                              onClick={() => handleCompleteDelivery(order.id)}
                            >
                              Concluir Entrega
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Entregas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Restaurante</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Distância</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Horário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryHistory.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{order.restaurant}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>R$ {order.value.toFixed(2)}</TableCell>
                      <TableCell>{order.distance}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{order.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryDashboard;
