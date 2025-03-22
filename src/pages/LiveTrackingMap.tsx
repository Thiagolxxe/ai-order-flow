
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPinIcon, ClockIcon, PhoneIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import the OrderTracker component with default import syntax
import OrderTracker from '@/components/orders/OrderTracker';

// Define interface for order data
interface Order {
  id: string;
  numero_pedido: string;
  status: string;
  restaurante_id: string;
  restaurante?: {
    nome: string;
    endereco: string;
    telefone?: string;
  };
  endereco_entrega: string;
  cidade_entrega: string;
  estado_entrega: string;
  cep_entrega: string;
  entregador_id?: string;
  entregador?: {
    id: string;
    latitude_atual?: number;
    longitude_atual?: number;
    tipo_veiculo?: string;
  };
  tempo_entrega_estimado?: string;
}

// Define interfaces for marker positions
interface MarkerPosition {
  lat: number;
  lng: number;
}

const LiveTrackingMap = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [restaurantPosition, setRestaurantPosition] = useState<MarkerPosition>({
    lat: -23.5505, 
    lng: -46.6333
  });
  const [deliveryPosition, setDeliveryPosition] = useState<MarkerPosition>({
    lat: -23.5605, 
    lng: -46.6433
  });
  const [userPosition, setUserPosition] = useState<MarkerPosition>({
    lat: -23.5705, 
    lng: -46.6533
  });
  const { user } = useUser();
  
  // Create custom icons for the map
  const restaurantIcon = new L.Icon({
    iconUrl: '/restaurant-marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
  
  const deliveryIcon = new L.Icon({
    iconUrl: '/delivery-marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
  
  const userIcon = new L.Icon({
    iconUrl: '/user-marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
        // Validate order ID format
        if (id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
          console.error('Invalid UUID format for order ID:', id);
          toast.error('ID de pedido inválido');
          setLoading(false);
          return;
        }
        
        const { data: orderData, error: orderError } = await supabase
          .from('pedidos')
          .select(`
            *,
            restaurante:restaurante_id (
              nome,
              endereco,
              telefone
            ),
            entregador:entregador_id (
              id,
              latitude_atual,
              longitude_atual,
              tipo_veiculo
            )
          `)
          .eq('id', id)
          .single();
        
        if (orderError) {
          console.error('Error fetching order details:', orderError);
          throw orderError;
        }
        
        setOrder(orderData);
        
        // Set positions with geocoded data (would use a real geocoding service in production)
        // Here we're just using mock positions for demonstration
        
        // Restaurant position (slightly randomized)
        setRestaurantPosition({
          lat: -23.5505 + (Math.random() * 0.01),
          lng: -46.6333 + (Math.random() * 0.01)
        });
        
        // Current delivery position (would be updated in real-time)
        if (orderData.entregador?.latitude_atual && orderData.entregador?.longitude_atual) {
          setDeliveryPosition({
            lat: orderData.entregador.latitude_atual,
            lng: orderData.entregador.longitude_atual
          });
        } else {
          // Fallback to mocked position
          setDeliveryPosition({
            lat: -23.5605 + (Math.random() * 0.02),
            lng: -46.6433 + (Math.random() * 0.02)
          });
        }
        
        // User/delivery address position
        setUserPosition({
          lat: -23.5705 + (Math.random() * 0.01),
          lng: -46.6533 + (Math.random() * 0.01)
        });
      } catch (error) {
        console.error('Error:', error);
        toast.error('Não foi possível carregar os detalhes do pedido');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
    
    // Set up periodic location updates (in a real app, would use WebSockets)
    const updateInterval = setInterval(() => {
      if (!loading && order?.status === 'em_entrega') {
        // Simulate delivery movement
        setDeliveryPosition(prev => ({
          lat: prev.lat + ((userPosition.lat - prev.lat) * 0.1),
          lng: prev.lng + ((userPosition.lng - prev.lng) * 0.1)
        }));
      }
    }, 5000);
    
    return () => {
      clearInterval(updateInterval);
    };
  }, [id, loading, order?.status, userPosition.lat, userPosition.lng]);
  
  if (loading) {
    return (
      <div className="container py-8">
        <div className="h-64 bg-muted animate-pulse rounded-lg mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 h-32 bg-muted animate-pulse rounded-lg"></div>
          <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Pedido não encontrado</h2>
        <p className="mb-6">O pedido que você está procurando não existe ou foi removido.</p>
        <Button asChild>
          <a href="/pedidos">Voltar para meus pedidos</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Rastreamento de Entrega</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Map */}
        <div className="md:col-span-2 rounded-xl overflow-hidden shadow-md">
          <MapContainer 
            center={[deliveryPosition.lat, deliveryPosition.lng]} 
            zoom={14} 
            style={{ height: '500px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker 
              position={[restaurantPosition.lat, restaurantPosition.lng]} 
              icon={restaurantIcon}
            >
              <Popup>
                <b>{order.restaurante?.nome}</b><br/>
                Restaurante
              </Popup>
            </Marker>
            
            <Marker 
              position={[deliveryPosition.lat, deliveryPosition.lng]} 
              icon={deliveryIcon}
            >
              <Popup>
                <b>Entregador</b><br/>
                {order.entregador?.tipo_veiculo || 'Moto'}
              </Popup>
            </Marker>
            
            <Marker 
              position={[userPosition.lat, userPosition.lng]} 
              icon={userIcon}
            >
              <Popup>
                <b>Seu endereço</b><br/>
                {order.endereco_entrega}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        
        {/* Order details */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-2">Informações do Pedido</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Número do Pedido</p>
                  <p className="font-medium">{order.numero_pedido}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={
                    order.status === 'entregue' ? 'success' : 
                    order.status === 'em_entrega' ? 'default' :
                    'secondary'
                  }>
                    {order.status === 'em_entrega' ? 'Em entrega' : 
                     order.status === 'entregue' ? 'Entregue' : 
                     order.status === 'preparando' ? 'Preparando' : 
                     order.status === 'pendente' ? 'Pendente' : 
                     order.status === 'cancelado' ? 'Cancelado' : 
                     order.status}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Restaurante</p>
                  <div className="flex items-start">
                    <MapPinIcon className="w-4 h-4 text-primary mt-1 mr-1 shrink-0" />
                    <p>{order.restaurante?.nome} - {order.restaurante?.endereco}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Entrega em</p>
                  <div className="flex items-start">
                    <MapPinIcon className="w-4 h-4 text-primary mt-1 mr-1 shrink-0" />
                    <p>{order.endereco_entrega}, {order.cidade_entrega} - {order.estado_entrega}, {order.cep_entrega}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Tempo estimado</p>
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 text-primary mr-1" />
                    <p>{order.tempo_entrega_estimado || '30-45 minutos'}</p>
                  </div>
                </div>
                
                {order.restaurante?.telefone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone do restaurante</p>
                    <div className="flex items-center">
                      <PhoneIcon className="w-4 h-4 text-primary mr-1" />
                      <p>{order.restaurante.telefone}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Status do Pedido</h2>
              <OrderTracker status={order.status} />
            </CardContent>
          </Card>
          
          <Button className="w-full">Entre em contato com o entregador</Button>
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
