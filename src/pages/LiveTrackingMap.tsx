
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { connectToDatabase } from '@/integrations/mongodb/client';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Map from '@/components/maps/Map';
import DriverMarker from '@/components/maps/DriverMarker';
import RestaurantMarker from '@/components/maps/RestaurantMarker';
import UserMarker from '@/components/maps/UserMarker';

const LiveTrackingMap = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Center of map (default: São Paulo)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-23.5505, -46.6333]);

  useEffect(() => {
    if (!id) {
      setError('ID do pedido não encontrado');
      setIsLoading(false);
      return;
    }

    const fetchOrderData = async () => {
      try {
        setIsLoading(true);
        // Connect to MongoDB
        const { db } = await connectToDatabase();
        
        // Fetch order data
        const orderResult = await db.collection('orders').findOne({ _id: id });
        
        if (!orderResult.data) {
          setError('Pedido não encontrado');
          setIsLoading(false);
          return;
        }
        
        const orderData = orderResult.data;
        setOrder(orderData);
        
        // Fetch restaurant data
        if (orderData.restaurante_id) {
          const restaurantResult = await db.collection('restaurants').findOne({ 
            _id: orderData.restaurante_id 
          });
          
          if (restaurantResult.data) {
            setRestaurant(restaurantResult.data);
          }
        }
        
        // Fetch driver data
        if (orderData.entregador_id) {
          const driverResult = await db.collection('drivers').findOne({ 
            id: orderData.entregador_id 
          });
          
          if (driverResult.data) {
            setDriver(driverResult.data);
            
            // Update map center to driver's position if available
            if (driverResult.data.latitude_atual && driverResult.data.longitude_atual) {
              setMapCenter([
                parseFloat(driverResult.data.latitude_atual), 
                parseFloat(driverResult.data.longitude_atual)
              ]);
            }
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching order data:', error);
        setError('Erro ao carregar dados do pedido');
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-gray-600">Carregando mapa de entrega...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Pedido não encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Não foi possível encontrar informações sobre este pedido.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock positions for demo
  const restaurantPosition: [number, number] = restaurant?.latitude 
    ? [parseFloat(restaurant.latitude), parseFloat(restaurant.longitude)]
    : [-23.5505, -46.6333];
    
  const driverPosition: [number, number] = driver?.latitude_atual 
    ? [parseFloat(driver.latitude_atual), parseFloat(driver.longitude_atual)]
    : [-23.5485, -46.6313];
    
  const deliveryPosition: [number, number] = [-23.5465, -46.6383];

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Rastreamento de Entrega</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full">
              <Map center={mapCenter} zoom={15}>
                {restaurant && (
                  <RestaurantMarker 
                    position={restaurantPosition} 
                    name={restaurant.nome || 'Restaurante'} 
                    address={restaurant.endereco || ''}
                  />
                )}
                
                {driver && (
                  <DriverMarker 
                    position={driverPosition} 
                    name="Entregador"
                    eta="10 min"
                  />
                )}
                
                <UserMarker 
                  position={deliveryPosition} 
                  address={order.endereco_entrega || 'Endereço de entrega'}
                />
              </Map>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Status do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Número do pedido</p>
                  <p className="text-gray-600">{order.numero_pedido || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="font-medium">Status</p>
                  <p className="text-gray-600">{order.status || 'Processando'}</p>
                </div>
                
                {driver && (
                  <div>
                    <p className="font-medium">Entregador</p>
                    <p className="text-gray-600">Chegando em aproximadamente 10 minutos</p>
                  </div>
                )}
                
                <div>
                  <p className="font-medium">Endereço de entrega</p>
                  <p className="text-gray-600">{order.endereco_entrega || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {restaurant && (
            <Card>
              <CardHeader>
                <CardTitle>Restaurante</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{restaurant.nome || 'N/A'}</p>
                  <p className="text-gray-600">{restaurant.endereco || 'N/A'}</p>
                  <p className="text-gray-600">{restaurant.telefone || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
