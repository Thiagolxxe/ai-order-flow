
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import DeliveryMap from '@/components/tracking/DeliveryMap';
import OrderStatusCard from '@/components/orders/OrderStatusCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define types for our data
interface Order {
  id: string;
  numero_pedido: string;
  status: string;
  restaurante_id: string;
  endereco_entrega: string;
  cidade_entrega: string;
  estado_entrega: string;
  criado_em: string;
  subtotal: number;
  taxa_entrega: number;
  total: number;
  entregador_id: string | null;
  status_pagamento: string;
  restaurante?: Restaurant;
  entregador?: Deliverer | null;
}

interface Restaurant {
  id: string;
  nome: string;
  logo_url?: string;
  endereco: string;
  cidade: string;
  estado: string;
  latitude?: number;
  longitude?: number;
}

interface Deliverer {
  id: string;
  latitude_atual?: number;
  longitude_atual?: number;
  tipo_veiculo?: string;
}

const LiveTrackingMap = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Mock coordinates for testing - would be replaced with real data
  const defaultCoordinates = {
    restaurant: { lat: -23.5505, lng: -46.6333 }, // São Paulo
    delivery: { lat: -23.5605, lng: -46.6433 }, // Slightly offset
    user: { lat: -23.5705, lng: -46.6533 }, // Slightly more offset
  };
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!id) {
          throw new Error('ID de pedido não encontrado');
        }
        
        // Check if id is in UUID format
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
          throw new Error('Formato de ID inválido');
        }
        
        const { data: orderData, error: orderError } = await supabase
          .from('pedidos')
          .select(`
            *,
            restaurante:restaurante_id (
              id, nome, logo_url, endereco, cidade, estado
            )
          `)
          .eq('id', id)
          .single();
        
        if (orderError) throw orderError;
        
        let entregador = null;
        
        if (orderData.entregador_id) {
          const { data: delivererData, error: delivererError } = await supabase
            .from('entregadores')
            .select('*')
            .eq('id', orderData.entregador_id)
            .single();
          
          if (!delivererError) {
            entregador = delivererData;
          }
        }
        
        setOrder({
          ...orderData,
          entregador
        });
        
      } catch (err) {
        console.error('Erro ao buscar detalhes do pedido:', err);
        setError(true);
        toast.error('Não foi possível carregar os detalhes do pedido');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);
  
  if (loading) {
    return (
      <div className="container p-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="container p-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Pedido não encontrado</h2>
          <p className="text-muted-foreground mb-6">
            Não foi possível encontrar os detalhes deste pedido. Ele pode ter sido excluído ou o link está incorreto.
          </p>
        </div>
      </div>
    );
  }
  
  // Calculate coordinates - in a real app, these would come from the database
  const restaurantPosition = order.restaurante?.latitude && order.restaurante?.longitude
    ? { lat: Number(order.restaurante.latitude), lng: Number(order.restaurante.longitude) }
    : defaultCoordinates.restaurant;
    
  const deliveryPosition = order.entregador?.latitude_atual && order.entregador?.longitude_atual
    ? { lat: Number(order.entregador.latitude_atual), lng: Number(order.entregador.longitude_atual) }
    : defaultCoordinates.delivery;
  
  // User position is the delivery address - would be geocoded in a real app
  const userPosition = defaultCoordinates.user;
  
  return (
    <div className="container p-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Rastreamento de Pedido</h1>
      <p className="text-muted-foreground mb-6">
        Acompanhe a entrega do seu pedido em tempo real
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status and Progress Column */}
        <div className="space-y-6 lg:col-span-1">
          {/* Order Status Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Pedido #{order.numero_pedido}</h2>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.criado_em).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {order.status === 'pendente' ? 'Confirmado' :
                   order.status === 'preparando' ? 'Em Preparo' :
                   order.status === 'em_entrega' ? 'Em Entrega' :
                   order.status === 'entregue' ? 'Entregue' : order.status}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Restaurante</p>
                  <p>{order.restaurante?.nome || 'Restaurante'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Endereço de entrega</p>
                  <p>{order.endereco_entrega}</p>
                  <p>{order.cidade_entrega} - {order.estado_entrega}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Status Pagamento</p>
                  <Badge variant={order.status_pagamento === 'pago' ? 'default' : 'secondary'} className="capitalize">
                    {order.status_pagamento}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Order Tracker */}
          <OrderStatusCard 
            status={order.status} 
            orderId={order.id}
          />
          
          {/* Delivery Information */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Informações do Entregador</h2>
              
              {order.entregador ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-lg font-medium">E</span>
                    </div>
                    <div>
                      <p className="font-medium">Entregador</p>
                      <p className="text-sm text-muted-foreground">Chegando em aprox. 15 min</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Veículo</p>
                    <p>{order.entregador.tipo_veiculo || 'Moto'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Um entregador ainda não foi designado para o seu pedido.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Map Column */}
        <div className="lg:col-span-2">
          <DeliveryMap 
            restaurantPosition={restaurantPosition}
            deliveryPosition={deliveryPosition}
            userPosition={userPosition}
            restaurantName={order.restaurante?.nome}
            vehicleType={order.entregador?.tipo_veiculo}
            deliveryAddress={order.endereco_entrega}
          />
          
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-3 bg-secondary rounded-lg flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Restaurante</span>
            </div>
            <div className="p-3 bg-secondary rounded-lg flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm">Entregador</span>
            </div>
            <div className="p-3 bg-secondary rounded-lg flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm">Seu Endereço</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
