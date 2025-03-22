
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ArrowLeftIcon, Package, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useParams } from 'react-router-dom';
import OrderTracker from '@/components/orders/OrderTracker';

// Fix the default marker icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icons
const restaurantIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/color/48/restaurant.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

const deliveryIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/color/48/motorcycle.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/color/48/home.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

// Mock order data
const mockOrder = {
  id: '1234',
  status: 'em_entrega',
  restaurante: {
    nome: 'Pizzaria Napolitana',
    endereco: 'Rua Augusta, 1500',
    posicao: [-23.555, -46.639]
  },
  entregador: {
    nome: 'João Silva',
    telefone: '(11) 99999-9999',
    posicao: [-23.550, -46.635]
  },
  cliente: {
    endereco: 'Av. Paulista, 1000',
    posicao: [-23.561, -46.655]
  },
  previsao_entrega: '15:45',
  items: [
    { nome: 'Pizza Margherita', quantidade: 1, valor: 45.90 },
    { nome: 'Refrigerante 2L', quantidade: 1, valor: 12.00 }
  ],
  total: 57.90,
  criado_em: '2023-06-10T14:30:00'
};

// Status mapping
const statusMap = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  preparando: 'Em preparação',
  pronto: 'Pronto para entrega',
  em_entrega: 'Em entrega',
  entregue: 'Entregue',
  cancelado: 'Cancelado'
};

// Status class mapping
const statusClassMap = {
  pendente: 'bg-yellow-500',
  confirmado: 'bg-blue-500',
  preparando: 'bg-orange-500',
  pronto: 'bg-indigo-500',
  em_entrega: 'bg-purple-500',
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
    const mins = diffInMinutes % 60;
    return `${hours}h ${mins}min atrás`;
  }
};

const LiveTrackingMap = () => {
  const [order, setOrder] = useState(mockOrder);
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();
  const [center, setCenter] = useState(order.entregador.posicao);
  
  useEffect(() => {
    // Simulating entregador movement
    const interval = setInterval(() => {
      setOrder(prev => {
        const latDiff = (prev.cliente.posicao[0] - prev.entregador.posicao[0]) * 0.1;
        const lngDiff = (prev.cliente.posicao[1] - prev.entregador.posicao[1]) * 0.1;
        
        return {
          ...prev,
          entregador: {
            ...prev.entregador,
            posicao: [
              prev.entregador.posicao[0] + latDiff,
              prev.entregador.posicao[1] + lngDiff
            ]
          }
        };
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-medium">Carregando informações do pedido...</h3>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-6 pb-20">
      {/* Voltar */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/pedidos/${id}`}>
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Rastreamento do Pedido #{order.id}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Acompanhe em tempo real</CardTitle>
                <Badge className={statusClassMap[order.status]}>
                  {statusMap[order.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full rounded-lg overflow-hidden mb-4">
                <MapContainer 
                  center={center as [number, number]} 
                  zoom={13} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {/* Restaurant Marker */}
                  <Marker position={order.restaurante.posicao as [number, number]} icon={restaurantIcon}>
                    <Popup>
                      <div>
                        <h3 className="font-bold">{order.restaurante.nome}</h3>
                        <p>{order.restaurante.endereco}</p>
                      </div>
                    </Popup>
                  </Marker>
                  
                  {/* Delivery Person Marker */}
                  <Marker position={order.entregador.posicao as [number, number]} icon={deliveryIcon}>
                    <Popup>
                      <div>
                        <h3 className="font-bold">Entregador</h3>
                        <p>{order.entregador.nome}</p>
                        <p>{order.entregador.telefone}</p>
                      </div>
                    </Popup>
                  </Marker>
                  
                  {/* Destination Marker */}
                  <Marker position={order.cliente.posicao as [number, number]} icon={destinationIcon}>
                    <Popup>
                      <div>
                        <h3 className="font-bold">Seu endereço</h3>
                        <p>{order.cliente.endereco}</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Package className="mr-1 h-4 w-4" />
                  <span>Pedido feito {getTimePassed(order.criado_em)}</span>
                </div>
                <div className="flex items-center text-sm font-medium">
                  <Navigation className="mr-1 h-4 w-4 text-primary" />
                  <span>Chegada prevista: {order.previsao_entrega}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Status do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTracker 
                orderId={order.id}
                initialStatus="preparing"
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Entregador</h3>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 13.18V11a8 8 0 0 0-16 0v2.18"></path><path d="M8 10v2a2 2 0 0 0 4 0v-2"></path><path d="M18 10v2a2 2 0 0 1-4 0v-2"></path><path d="M2 9.5V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9.5a2.5 2.5 0 0 0-5 0v7.5"></path><path d="M6 13h12"></path></svg>
                    </div>
                    <div>
                      <p className="font-medium">{order.entregador.nome}</p>
                      <p className="text-sm text-muted-foreground">{order.entregador.telefone}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Restaurante</h3>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 9L12 5 2 9"></path><path d="M12 5v14"></path><path d="m4.2 10.4 7.8 4.6 7.8-4.6"></path></svg>
                    </div>
                    <div>
                      <p className="font-medium">{order.restaurante.nome}</p>
                      <p className="text-sm text-muted-foreground">{order.restaurante.endereco}</p>
                    </div>
                  </div>
                </div>
                
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
                
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Itens do pedido</h3>
                  <ul className="space-y-3">
                    {order.items.map((item, index) => (
                      <li key={index} className="flex justify-between">
                        <div>
                          <p>{item.quantidade}x {item.nome}</p>
                        </div>
                        <p className="font-medium">R$ {item.valor.toFixed(2)}</p>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="border-t mt-4 pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <p>Total</p>
                      <p>R$ {order.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full" variant="outline">
                  Entrar em contato com o entregador
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
