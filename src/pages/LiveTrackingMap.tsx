
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';

// Fix para ícones do leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Componente de status de entrega
const DeliveryStatus = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'em_preparo':
        return 'bg-yellow-500';
      case 'a_caminho':
        return 'bg-blue-500';
      case 'entregue':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pendente':
        return 'Pedido Pendente';
      case 'confirmado':
        return 'Pedido Confirmado';
      case 'em_preparo':
        return 'Em Preparo';
      case 'pronto':
        return 'Pronto para Entrega';
      case 'a_caminho':
        return 'A Caminho';
      case 'entregue':
        return 'Entregue';
      case 'cancelado':
        return 'Cancelado';
      default:
        return 'Status Desconhecido';
    }
  };

  return (
    <div className="flex items-center mb-4">
      <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor()}`}></div>
      <span className="font-medium">{getStatusText()}</span>
    </div>
  );
};

const LiveTrackingMap = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { isAuthenticated } = useUser();
  const [orderData, setOrderData] = useState<any>(null);
  const [deliveryLocation, setDeliveryLocation] = useState<[number, number]>([51.505, -0.09]);
  const [restaurantLocation, setRestaurantLocation] = useState<[number, number]>([51.51, -0.1]);
  const [destinationLocation, setDestinationLocation] = useState<[number, number]>([51.49, -0.08]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || !isAuthenticated) return;

    const fetchOrderData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('pedidos')
          .select(`
            *,
            restaurantes (
              nome,
              endereco,
              cidade,
              estado
            ),
            entregadores (
              id,
              latitude_atual,
              longitude_atual
            )
          `)
          .eq('id', orderId)
          .single();

        if (error) throw error;
        
        setOrderData(data);
        
        // Definir localizações para o mapa (simulado por enquanto)
        if (data.entregadores?.latitude_atual && data.entregadores?.longitude_atual) {
          setDeliveryLocation([data.entregadores.latitude_atual, data.entregadores.longitude_atual]);
        } else {
          // Localização simulada do entregador
          setDeliveryLocation([51.505, -0.09]);
        }
        
        // Localização simulada do restaurante
        setRestaurantLocation([51.51, -0.1]);
        
        // Localização simulada do destino
        setDestinationLocation([51.49, -0.08]);
        
      } catch (error: any) {
        console.error('Erro ao buscar dados do pedido:', error);
        setError('Não foi possível carregar os dados do pedido.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
    
    // Simular atualização da posição do entregador a cada 30 segundos
    const interval = setInterval(() => {
      setDeliveryLocation(prev => [
        prev[0] + (Math.random() * 0.002 - 0.001),
        prev[1] + (Math.random() * 0.002 - 0.001)
      ]);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [orderId, isAuthenticated]);

  if (loading) {
    return (
      <div className="container py-8">
        <Card className="w-full h-96 flex items-center justify-center">
          <CardContent>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-10 text-center">
            <h2 className="text-xl font-semibold mb-2">Erro ao carregar</h2>
            <p className="text-muted-foreground">{error || 'Pedido não encontrado'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Acompanhamento ao vivo da entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] w-full rounded-md overflow-hidden">
                <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {/* Marcador do Entregador */}
                  <Marker position={deliveryLocation}>
                    <Popup>
                      Entregador<br />Em movimento
                    </Popup>
                  </Marker>
                  
                  {/* Marcador do Restaurante */}
                  <Marker position={restaurantLocation}>
                    <Popup>
                      {orderData.restaurantes?.nome || 'Restaurante'}<br />
                      Origem do pedido
                    </Popup>
                  </Marker>
                  
                  {/* Marcador do Destino */}
                  <Marker position={destinationLocation}>
                    <Popup>
                      Seu endereço<br />
                      Destino da entrega
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Detalhes da entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <DeliveryStatus status={orderData.status} />
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Pedido #{orderData.numero_pedido}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(orderData.criado_em).toLocaleString('pt-BR')}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Restaurante</h3>
                  <p>{orderData.restaurantes?.nome || 'Nome do restaurante'}</p>
                  <p className="text-sm text-muted-foreground">
                    {orderData.restaurantes?.endereco}, {orderData.restaurantes?.cidade} - {orderData.restaurantes?.estado}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Endereço de entrega</h3>
                  <p>{orderData.endereco_entrega}</p>
                  <p className="text-sm text-muted-foreground">
                    {orderData.cidade_entrega} - {orderData.estado_entrega}, {orderData.cep_entrega}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Tempo estimado</h3>
                  <p className="text-2xl font-bold">
                    {orderData.tempo_entrega_estimado 
                      ? new Date(orderData.tempo_entrega_estimado).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                      : '25-35 min'}
                  </p>
                </div>
                
                {orderData.entregadores && (
                  <div>
                    <h3 className="font-semibold mb-1">Entregador</h3>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                        <span className="text-lg font-bold">E</span>
                      </div>
                      <div>
                        <p className="font-medium">Entregador</p>
                        <p className="text-sm text-muted-foreground">ID: {orderData.entregadores.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
