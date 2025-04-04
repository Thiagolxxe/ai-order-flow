
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, MapPinned, Clock, User, Box, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Map from '@/components/maps/Map';
import DriverMarker from '@/components/maps/DriverMarker';
import RestaurantMarker from '@/components/maps/RestaurantMarker';
import UserMarker from '@/components/maps/UserMarker';
import { connectToDatabase } from '@/integrations/mongodb/client';
import { toast } from 'sonner';

// Define types for the component
interface Order {
  id: string;
  numero_pedido: string;
  status: string;
  restaurante_id: string;
  endereco_entrega: string;
  cidade_entrega: string;
  estado_entrega: string;
  entregador_id?: string;
  restaurante?: Restaurant;
  entregador?: Driver;
}

interface Restaurant {
  id: string;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  latitude?: number;
  longitude?: number;
}

interface Driver {
  id: string;
  latitude_atual?: number;
  longitude_atual?: number;
  tipo_veiculo?: string;
}

const mockLocations = {
  restaurant: {
    latitude: -23.5505,
    longitude: -46.6333,
  },
  user: {
    latitude: -23.5605,
    longitude: -46.6233,
  },
  driver: {
    latitude: -23.5555,
    longitude: -46.6283,
  },
};

const LiveTrackingMap: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        
        // Connect to MongoDB
        const { db } = await connectToDatabase();
        
        // Fetch order data
        const orderCollection = db.collection('orders');
        const orderResult = await orderCollection.findOne({ _id: id });
        
        if (orderResult.error || !orderResult.data) {
          throw new Error('Pedido não encontrado');
        }
        
        const orderData = orderResult.data;
        
        // Fetch restaurant data
        const restaurantCollection = db.collection('restaurants');
        const restaurantResult = await restaurantCollection.findOne({ _id: orderData.restaurante_id });
        
        // Fetch driver data if available
        let driverData = null;
        if (orderData.entregador_id) {
          const driverCollection = db.collection('drivers');
          const driverResult = await driverCollection.findOne({ _id: orderData.entregador_id });
          
          if (!driverResult.error && driverResult.data) {
            driverData = driverResult.data;
          }
        }
        
        // Set the order state with all data
        setOrder({
          id: orderData._id,
          numero_pedido: orderData.numero_pedido,
          status: orderData.status,
          restaurante_id: orderData.restaurante_id,
          endereco_entrega: orderData.endereco_entrega,
          cidade_entrega: orderData.cidade_entrega,
          estado_entrega: orderData.estado_entrega,
          entregador_id: orderData.entregador_id,
          restaurante: restaurantResult.data ? {
            id: restaurantResult.data._id,
            nome: restaurantResult.data.nome,
            endereco: restaurantResult.data.endereco,
            cidade: restaurantResult.data.cidade,
            estado: restaurantResult.data.estado,
            latitude: mockLocations.restaurant.latitude,
            longitude: mockLocations.restaurant.longitude,
          } : undefined,
          entregador: driverData ? {
            id: driverData._id,
            latitude_atual: driverData.latitude_atual || mockLocations.driver.latitude,
            longitude_atual: driverData.longitude_atual || mockLocations.driver.longitude,
            tipo_veiculo: driverData.tipo_veiculo
          } : undefined
        });
      } catch (err: any) {
        console.error('Erro ao carregar dados do pedido:', err);
        setError(err.message || 'Erro ao carregar dados do pedido');
        toast.error('Erro ao carregar dados do pedido');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderData();
    }
  }, [id]);

  const handleContactDriver = () => {
    toast.info('Iniciando chat com o entregador...');
    // Implementation would redirect to chat or open chat modal
  };

  if (loading) {
    return (
      <div className="container py-8 flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-32 w-32 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="p-8 flex flex-col items-center">
            <MapPinned className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Erro ao carregar mapa</h2>
            <p className="text-muted-foreground mb-4">{error || 'Pedido não encontrado'}</p>
            <Button onClick={() => window.history.back()}>Voltar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Rastreamento do Pedido #{order.numero_pedido}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <h2 className="font-semibold flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-primary" />
              Status do Pedido
            </h2>
          </CardHeader>
          <CardContent>
            <div className="font-medium text-xl mb-2">
              {formatOrderStatus(order.status)}
            </div>
            <div className="text-muted-foreground text-sm">
              {getStatusDescription(order.status)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <h2 className="font-semibold flex items-center">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Tempo Estimado
            </h2>
          </CardHeader>
          <CardContent>
            <div className="font-medium text-xl mb-2">
              20-30 minutos
            </div>
            <div className="text-muted-foreground text-sm">
              O seu pedido está a caminho
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <h2 className="font-semibold flex items-center">
              <User className="mr-2 h-5 w-5 text-primary" />
              Entregador
            </h2>
          </CardHeader>
          <CardContent>
            {order.entregador ? (
              <>
                <div className="font-medium text-xl mb-2">
                  Carlos Silva
                </div>
                <div className="text-muted-foreground text-sm mb-3">
                  {order.entregador.tipo_veiculo || 'Moto'} • Avaliação: 4.8
                </div>
                <Button onClick={handleContactDriver} size="sm" variant="outline" className="w-full">
                  Entrar em contato
                </Button>
              </>
            ) : (
              <div className="text-muted-foreground">
                Entregador ainda não designado
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-0 h-[400px] relative">
          <Map 
            center={
              order.entregador 
                ? [order.entregador.latitude_atual || 0, order.entregador.longitude_atual || 0]
                : [mockLocations.restaurant.latitude, mockLocations.restaurant.longitude]
            }
            zoom={15}
          >
            {order.restaurante && (
              <RestaurantMarker 
                position={[
                  order.restaurante.latitude || mockLocations.restaurant.latitude,
                  order.restaurante.longitude || mockLocations.restaurant.longitude
                ]}
                name={order.restaurante.nome}
              />
            )}
            
            <UserMarker 
              position={[mockLocations.user.latitude, mockLocations.user.longitude]}
              address={`${order.endereco_entrega}, ${order.cidade_entrega}`}
            />
            
            {order.entregador && (
              <DriverMarker 
                position={[
                  order.entregador.latitude_atual || mockLocations.driver.latitude,
                  order.entregador.longitude_atual || mockLocations.driver.longitude
                ]}
                name="Carlos Silva"
                vehicleType={order.entregador.tipo_veiculo || 'Moto'}
              />
            )}
          </Map>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <h2 className="font-semibold flex items-center">
              <Truck className="mr-2 h-5 w-5 text-primary" />
              Endereço de Entrega
            </h2>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{order.endereco_entrega}</p>
            <p className="text-muted-foreground">
              {order.cidade_entrega}, {order.estado_entrega}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <h2 className="font-semibold flex items-center">
              <Box className="mr-2 h-5 w-5 text-primary" />
              Detalhes do Pedido
            </h2>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {order.restaurante?.nome || 'Restaurante'}
            </p>
            <p className="text-muted-foreground">
              Pedido #{order.numero_pedido}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper functions to format status
function formatOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pendente': 'Aguardando confirmação',
    'confirmado': 'Pedido confirmado',
    'preparando': 'Em preparação',
    'pronto': 'Pronto para entrega',
    'em_entrega': 'Em rota de entrega',
    'entregue': 'Entregue',
    'cancelado': 'Cancelado'
  };
  
  return statusMap[status] || status;
}

function getStatusDescription(status: string): string {
  const descriptionMap: Record<string, string> = {
    'pendente': 'O restaurante ainda não confirmou seu pedido',
    'confirmado': 'O restaurante está recebendo seu pedido',
    'preparando': 'Seu pedido está sendo preparado agora',
    'pronto': 'Seu pedido está pronto e aguardando o entregador',
    'em_entrega': 'O entregador está a caminho do seu endereço',
    'entregue': 'Seu pedido foi entregue com sucesso',
    'cancelado': 'Este pedido foi cancelado'
  };
  
  return descriptionMap[status] || '';
}

export default LiveTrackingMap;
