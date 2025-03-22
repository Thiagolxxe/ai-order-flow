
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from "@/components/ui/skeleton";

// Import our new components
import DeliveryMap from '@/components/tracking/DeliveryMap';
import OrderDetailsCard from '@/components/orders/OrderDetailsCard';
import OrderStatusCard from '@/components/orders/OrderStatusCard';

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
    latitude_atual?: number | null;
    longitude_atual?: number | null;
    tipo_veiculo?: string | null;
  } | null;
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
        
        // Ensure we set a proper Order object with the right types
        setOrder({
          ...orderData,
          entregador: orderData.entregador || null
        });
        
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
            lat: Number(orderData.entregador.latitude_atual),
            lng: Number(orderData.entregador.longitude_atual)
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
        <div className="md:col-span-2">
          <DeliveryMap
            restaurantPosition={restaurantPosition}
            deliveryPosition={deliveryPosition}
            userPosition={userPosition}
            restaurantName={order.restaurante?.nome}
            vehicleType={order.entregador?.tipo_veiculo}
            deliveryAddress={order.endereco_entrega}
          />
        </div>
        
        {/* Order details */}
        <div className="space-y-4">
          <OrderDetailsCard 
            orderNumber={order.numero_pedido}
            status={order.status}
            restaurantName={order.restaurante?.nome}
            restaurantAddress={order.restaurante?.endereco}
            deliveryAddress={order.endereco_entrega}
            deliveryCity={order.cidade_entrega}
            deliveryState={order.estado_entrega}
            deliveryZip={order.cep_entrega}
            estimatedTime={order.tempo_entrega_estimado || '30-45 minutos'}
            restaurantPhone={order.restaurante?.telefone}
          />
          
          <OrderStatusCard 
            status={order.status} 
            orderId={order.id}
          />
          
          <Button className="w-full">Entre em contato com o entregador</Button>
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
