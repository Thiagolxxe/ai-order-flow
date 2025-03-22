
import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useParams } from 'react-router-dom';
import OrderTracker from '@/components/orders/OrderTracker';

// Fix the default marker icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ícone personalizado para restaurante
const restaurantIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1147/1147933.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Ícone personalizado para entregador
const deliveryIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830312.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Ícone personalizado para cliente
const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1077/1077063.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Componente para atualizar a visualização do mapa
const UpdateMapView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

// Dados fictícios para a demonstração
const mockOrder = {
  id: 'ord-123456',
  restaurante: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    nome: 'Burger Place',
    endereco: 'Av. Paulista, 1000',
    lat: -23.5674,
    lng: -46.6476
  },
  entregador: {
    id: '223e4567-e89b-12d3-a456-426614174001',
    nome: 'João Silva',
    telefone: '(11) 98765-4321',
    lat: -23.5694,
    lng: -46.6426,
    avaliacao: 4.8
  },
  cliente: {
    endereco: 'Rua Augusta, 500',
    lat: -23.5644,
    lng: -46.6526
  },
  status: 'em_transito',
  previsao_entrega: '2023-06-10T18:30:00',
  criado_em: '2023-06-10T17:45:00'
};

// Estado do pedido
const statusMap = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  preparando: 'Preparando',
  pronto: 'Pronto para entrega',
  em_transito: 'Em trânsito',
  entregue: 'Entregue',
  cancelado: 'Cancelado'
};

// Cores do status
const statusColors = {
  pendente: 'bg-gray-400',
  confirmado: 'bg-blue-400',
  preparando: 'bg-yellow-400',
  pronto: 'bg-indigo-400',
  em_transito: 'bg-purple-400',
  entregue: 'bg-green-500',
  cancelado: 'bg-red-500'
};

const getTimePassed = (dateString: string) => {
  const orderDate = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min atrás`;
  } else {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
  }
};

const LiveTrackingMap = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(mockOrder);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Aqui você buscaria os dados reais do pedido
    // Validar formato de UUID
    if (id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      console.error('Invalid UUID format for order ID:', id);
      // Handle the error appropriately
    }
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [id]);
  
  // Calcular o centro do mapa para mostrar todos os pontos
  const center: [number, number] = [
    (order.restaurante.lat + order.entregador.lat + order.cliente.lat) / 3,
    (order.restaurante.lng + order.entregador.lng + order.cliente.lng) / 3
  ];
  
  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-96 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-6 pb-20">
      {/* Voltar */}
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link to="/pedidos">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Voltar para meus pedidos
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mapa de rastreamento ao vivo */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Rastreamento ao vivo</CardTitle>
                <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                  {statusMap[order.status as keyof typeof statusMap]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full rounded-lg overflow-hidden mb-4">
                <MapContainer 
                  zoom={13} 
                  style={{ height: '100%', width: '100%' }}
                  center={center}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {/* Marcador do restaurante */}
                  <Marker 
                    position={[order.restaurante.lat, order.restaurante.lng]} 
                    icon={restaurantIcon}
                  >
                    <Popup>
                      <div className="text-center font-medium">{order.restaurante.nome}</div>
                      <div className="text-sm">{order.restaurante.endereco}</div>
                    </Popup>
                  </Marker>
                  
                  {/* Marcador do entregador */}
                  <Marker 
                    position={[order.entregador.lat, order.entregador.lng]} 
                    icon={deliveryIcon}
                  >
                    <Popup>
                      <div className="text-center font-medium">Entregador: {order.entregador.nome}</div>
                      <div className="text-sm">Telefone: {order.entregador.telefone}</div>
                    </Popup>
                  </Marker>
                  
                  {/* Marcador do destino */}
                  <Marker 
                    position={[order.cliente.lat, order.cliente.lng]} 
                    icon={userIcon}
                  >
                    <Popup>
                      <div className="text-center font-medium">Seu endereço</div>
                      <div className="text-sm">{order.cliente.endereco}</div>
                    </Popup>
                  </Marker>
                  
                  <UpdateMapView center={center} />
                </MapContainer>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Última atualização: {getTimePassed(order.criado_em)}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Detalhes do pedido e rastreamento */}
        <div className="space-y-6">
          {/* Status do pedido */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Status do pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTracker 
                orderId={order.id}
                initialStatus="preparing"
              />
            </CardContent>
          </Card>
          
          {/* Informações do entregador */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Seu entregador</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarImage src="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200" />
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-base">{order.entregador.nome}</h3>
                  <div className="flex items-center mt-1 text-amber-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    <span>{order.entregador.avaliacao}</span>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <Button className="w-full" variant="outline">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                Ligar para o entregador
              </Button>
            </CardContent>
          </Card>
          
          {/* Endereço de entrega */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Detalhes da entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Local de entrega</h3>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0 Z"></path><path d="M12 2a10 10 0 0 0-6.88 2.77L12 12l6.88-7.23A10 10 0 0 0 12 2Z"></path><path d="m2.27 13.27 10-1.27 1.23 10a10.02 10.02 0 0 1-11.23-8.73Z"></path></svg>
                     </div>
                     <div>
                       <p className="font-medium">Seu endereço</p>
                       <p className="text-sm text-muted-foreground">{order.cliente.endereco}</p>
                     </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Previsão de entrega</h3>
                  <p className="font-medium">{new Date(order.previsao_entrega).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
