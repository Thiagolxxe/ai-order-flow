import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { 
  BagIcon, 
  ClockIcon,
  MenuIcon,
  StatsIcon,
  SearchIcon,
  AlertIcon,
  StarIcon
} from "@/assets/icons";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

// Componente de gerenciamento de menu
const MenuManagement = () => {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState([
    { id: '1', name: 'Classic Burger', price: 26.90, category: 'Hambúrgueres', status: 'available' },
    { id: '2', name: 'Cheeseburger Bacon', price: 32.90, category: 'Hambúrgueres', status: 'available' },
    { id: '3', name: 'Batata Frita', price: 14.90, category: 'Acompanhamentos', status: 'available' },
    { id: '4', name: 'Milk Shake', price: 16.90, category: 'Bebidas', status: 'available' },
  ]);

  const handleStatusChange = (id: string, status: string) => {
    setMenuItems(prev => 
      prev.map(item => item.id === id ? { ...item, status } : item)
    );
    toast({
      title: "Item atualizado",
      description: "O status do item foi alterado com sucesso."
    });
  };

  const addMenuItem = () => {
    toast({
      title: "Novo item",
      description: "Funcionalidade para adicionar novo item será implementada."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Cardápio</h2>
        <Button onClick={addMenuItem}>
          Adicionar Item
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <InputWithIcon 
          placeholder="Buscar item..." 
          className="max-w-xs"
          icon={<SearchIcon className="h-4 w-4" />}
        />
        <Button variant="outline">Filtrar</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {menuItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>R$ {item.price.toFixed(2).replace('.', ',')}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  item.status === 'available' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {item.status === 'available' ? 'Disponível' : 'Indisponível'}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Editar</Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleStatusChange(
                      item.id, 
                      item.status === 'available' ? 'unavailable' : 'available'
                    )}
                  >
                    {item.status === 'available' ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Componente de gestão de horários
const HoursManagement = () => {
  const { toast } = useToast();
  const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const [hours, setHours] = useState([
    { day: 'Segunda', open: '09:00', close: '22:00', isOpen: true },
    { day: 'Terça', open: '09:00', close: '22:00', isOpen: true },
    { day: 'Quarta', open: '09:00', close: '22:00', isOpen: true },
    { day: 'Quinta', open: '09:00', close: '22:00', isOpen: true },
    { day: 'Sexta', open: '09:00', close: '23:00', isOpen: true },
    { day: 'Sábado', open: '10:00', close: '23:00', isOpen: true },
    { day: 'Domingo', open: '10:00', close: '22:00', isOpen: true },
  ]);

  const handleSaveHours = () => {
    toast({
      title: "Horários atualizados",
      description: "Os horários de funcionamento foram atualizados com sucesso."
    });
  };

  const toggleDay = (day: string) => {
    setHours(prev => 
      prev.map(item => item.day === day ? { ...item, isOpen: !item.isOpen } : item)
    );
  };

  const handleHourChange = (day: string, field: 'open' | 'close', value: string) => {
    setHours(prev => 
      prev.map(item => item.day === day ? { ...item, [field]: value } : item)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Horários de Funcionamento</h2>
        <Button onClick={handleSaveHours}>Salvar Alterações</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {hours.map((hour) => (
              <div key={hour.day} className="flex items-center gap-4">
                <div className="w-24 font-medium">{hour.day}</div>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={hour.open}
                    onChange={(e) => handleHourChange(hour.day, 'open', e.target.value)}
                    disabled={!hour.isOpen}
                    className="w-32"
                  />
                  <span>até</span>
                  <Input
                    type="time"
                    value={hour.close}
                    onChange={(e) => handleHourChange(hour.day, 'close', e.target.value)}
                    disabled={!hour.isOpen}
                    className="w-32"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleDay(hour.day)}
                >
                  {hour.isOpen ? 'Fechado' : 'Aberto'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente de gestão de pedidos
const OrdersManagement = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState([
    { id: '4815', customer: 'João Silva', items: 3, total: 85.70, status: 'pending', time: '15 min atrás' },
    { id: '4814', customer: 'Maria Souza', items: 2, total: 56.80, status: 'preparing', time: '28 min atrás' },
    { id: '4813', customer: 'Pedro Santos', items: 4, total: 112.50, status: 'ready', time: '42 min atrás' },
    { id: '4812', customer: 'Ana Oliveira', items: 1, total: 32.90, status: 'delivered', time: '1h atrás' },
    { id: '4811', customer: 'Carlos Pereira', items: 3, total: 76.40, status: 'delivered', time: '1h 15min atrás' },
  ]);

  const updateOrderStatus = (id: string, status: string) => {
    setOrders(prev => 
      prev.map(order => order.id === id ? { ...order, status } : order)
    );
    toast({
      title: "Pedido atualizado",
      description: `Pedido #${id} atualizado para ${getStatusLabel(status)}`
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Pronto para entrega';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Pedidos</h2>
        <div className="flex gap-2">
          <Button variant="outline">Histórico Completo</Button>
          <Button variant="outline">Exportar Relatório</Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <InputWithIcon 
          placeholder="Buscar pedido..." 
          className="max-w-xs" 
          icon={<SearchIcon className="h-4 w-4" />}
        />
        <Button variant="outline">Filtrar</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pedido #</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Itens</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Hora</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">#{order.id}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>{order.items}</TableCell>
              <TableCell>R$ {order.total.toFixed(2).replace('.', ',')}</TableCell>
              <TableCell>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  getStatusBadgeClass(order.status)
                }`}>
                  {getStatusLabel(order.status)}
                </div>
              </TableCell>
              <TableCell>{order.time}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Ver Detalhes</Button>
                  {order.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                    >
                      Aceitar
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                    >
                      Marcar Pronto
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Página principal do painel administrativo
const RestaurantAdmin = () => {
  const { toast } = useToast();

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Painel do Restaurante</h1>
      
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
            <BagIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 comparado a ontem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Hoje</CardTitle>
            <StatsIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 657,80</div>
            <p className="text-xs text-muted-foreground">+10% comparado a ontem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <StarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.7</div>
            <p className="text-xs text-muted-foreground">8 novas avaliações</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Entrega</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28 min</div>
            <p className="text-xs text-muted-foreground">-3 min comparado a ontem</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs de gerenciamento */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <BagIcon className="h-4 w-4" />
            <span>Pedidos</span>
          </TabsTrigger>
          <TabsTrigger value="menu" className="flex items-center gap-2">
            <MenuIcon className="h-4 w-4" />
            <span>Cardápio</span>
          </TabsTrigger>
          <TabsTrigger value="hours" className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4" />
            <span>Horários</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="space-y-4">
          <OrdersManagement />
        </TabsContent>
        
        <TabsContent value="menu" className="space-y-4">
          <MenuManagement />
        </TabsContent>
        
        <TabsContent value="hours" className="space-y-4">
          <HoursManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantAdmin;
